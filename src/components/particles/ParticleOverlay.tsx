import { useEffect, useRef } from 'react';

interface ParticleOverlayProps {
  theme: string;
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const ParticleOverlay = ({ theme, enabled }: ParticleOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Determine particle style based on theme
    const getParticleConfig = () => {
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 30 : 60;
      
      switch (theme) {
        case 'rain':
          return { count: particleCount, color: 'rgba(173, 216, 230, 0.6)', type: 'rain' };
        case 'snow':
        case 'mountains':
          return { count: particleCount, color: 'rgba(255, 255, 255, 0.7)', type: 'snow' };
        case 'night':
          return { count: particleCount * 1.5, color: 'rgba(255, 255, 150, 0.8)', type: 'stars' };
        case 'forest':
          return { count: particleCount * 0.5, color: 'rgba(144, 238, 144, 0.3)', type: 'leaves' };
        default:
          return { count: particleCount, color: 'rgba(255, 255, 255, 0.5)', type: 'sparkles' };
      }
    };

    const config = getParticleConfig();
    
    // Initialize particles
    particlesRef.current = Array.from({ length: config.count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * (config.type === 'rain' ? 0.5 : 1),
      speedY: config.type === 'rain' ? Math.random() * 5 + 5 : 
              config.type === 'snow' ? Math.random() * 2 + 1 : 
              (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Twinkle effect for stars
        if (config.type === 'stars') {
          particle.opacity = Math.sin(Date.now() * 0.001 + particle.x) * 0.4 + 0.5;
        }

        // Draw particle
        ctx.beginPath();
        if (config.type === 'stars') {
          // Draw star shape
          const spikes = 5;
          const outerRadius = particle.size;
          const innerRadius = particle.size / 2;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = particle.x + Math.cos(angle) * radius;
            const y = particle.y + Math.sin(angle) * radius;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
        } else {
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        }
        
        ctx.fillStyle = config.color.replace(/[\d.]+\)$/g, `${particle.opacity})`);
        ctx.fill();
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
  }, [theme, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
