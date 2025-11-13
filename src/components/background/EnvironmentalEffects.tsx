import { useEffect, useRef } from 'react';

interface EnvironmentalEffectsProps {
  theme: string;
  intensity: number;
  enabled: boolean;
}

interface Effect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'mist' | 'leaf' | 'ripple' | 'particle';
  life: number;
  maxLife: number;
}

export const EnvironmentalEffects = ({ theme, intensity, enabled }: EnvironmentalEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectsRef = useRef<Effect[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const getEffectConfig = () => {
      const isMobile = window.innerWidth < 768;
      const baseCount = isMobile ? 15 : 30;

      switch (theme) {
        case 'rain':
        case 'storm':
          return {
            count: Math.floor(baseCount * intensity * 2),
            type: 'particle' as const,
            behavior: 'rain',
            color: 'rgba(173, 216, 230, 0.6)',
          };
        case 'forest':
        case 'nature':
          return {
            count: Math.floor(baseCount * intensity),
            type: 'leaf' as const,
            behavior: 'drift',
            color: 'rgba(144, 238, 144, 0.4)',
          };
        case 'ocean':
        case 'beach':
          return {
            count: Math.floor(baseCount * intensity * 0.5),
            type: 'ripple' as const,
            behavior: 'ripple',
            color: 'rgba(173, 216, 230, 0.3)',
          };
        case 'snow':
        case 'mountains':
          return {
            count: Math.floor(baseCount * intensity * 1.5),
            type: 'particle' as const,
            behavior: 'snow',
            color: 'rgba(255, 255, 255, 0.8)',
          };
        default:
          return {
            count: Math.floor(baseCount * intensity * 0.5),
            type: 'mist' as const,
            behavior: 'mist',
            color: 'rgba(255, 255, 255, 0.2)',
          };
      }
    };

    const config = getEffectConfig();

    // Initialize effects
    const createEffect = (): Effect => {
      const x = Math.random() * canvas.width;
      const y = config.behavior === 'rain' ? -10 : Math.random() * canvas.height;
      const maxLife = Math.random() * 200 + 100;

      return {
        x,
        y,
        vx: config.behavior === 'rain' ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.5,
        vy: config.behavior === 'rain' ? Math.random() * 8 + 10 : 
            config.behavior === 'snow' ? Math.random() * 1 + 0.5 : 
            (Math.random() - 0.5) * 0.3,
        size: Math.random() * (config.type === 'leaf' ? 8 : 4) + 2,
        opacity: Math.random() * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        type: config.type,
        life: maxLife,
        maxLife,
      };
    };

    effectsRef.current = Array.from({ length: config.count }, createEffect);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      effectsRef.current.forEach((effect, index) => {
        // Update position
        effect.x += effect.vx;
        effect.y += effect.vy;
        effect.rotation += effect.rotationSpeed;
        effect.life--;

        // Respawn if out of bounds or life ended
        if (
          effect.x < -50 || effect.x > canvas.width + 50 ||
          effect.y < -50 || effect.y > canvas.height + 50 ||
          effect.life <= 0
        ) {
          effectsRef.current[index] = createEffect();
          return;
        }

        // Draw based on type
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.rotation);

        const fadeOpacity = Math.min(effect.life / 50, 1) * effect.opacity;

        if (effect.type === 'leaf') {
          // Draw leaf shape
          ctx.fillStyle = config.color.replace(/[\d.]+\)$/g, `${fadeOpacity})`);
          ctx.beginPath();
          ctx.ellipse(0, 0, effect.size, effect.size * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect.type === 'ripple') {
          // Draw expanding ripple
          const progress = 1 - (effect.life / effect.maxLife);
          const radius = effect.size * (1 + progress * 3);
          ctx.strokeStyle = config.color.replace(/[\d.]+\)$/g, `${fadeOpacity * (1 - progress)})`);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (effect.type === 'mist') {
          // Draw soft mist cloud
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effect.size * 2);
          gradient.addColorStop(0, config.color.replace(/[\d.]+\)$/g, `${fadeOpacity})`));
          gradient.addColorStop(1, config.color.replace(/[\d.]+\)$/g, `0)`));
          ctx.fillStyle = gradient;
          ctx.fillRect(-effect.size * 2, -effect.size * 2, effect.size * 4, effect.size * 4);
        } else {
          // Draw particle
          ctx.fillStyle = config.color.replace(/[\d.]+\)$/g, `${fadeOpacity})`);
          ctx.fillRect(-effect.size / 2, -effect.size / 2, effect.size, effect.size);
        }

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, intensity, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
