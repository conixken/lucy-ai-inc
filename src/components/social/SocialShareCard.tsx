import { useEffect, useRef } from 'react';
import { AdvancedLucyAvatar } from '../avatar/AdvancedLucyAvatar';

interface SocialShareCardProps {
  title: string;
  subtitle?: string;
  type?: 'default' | 'thinking' | 'referral' | 'conversation';
  referralCode?: string;
}

export const SocialShareCard = ({ 
  title, 
  subtitle = 'Your Intelligent Digital Companion',
  type = 'default',
  referralCode
}: SocialShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions for OG image
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#7B3FF2');
    gradient.addColorStop(0.5, '#5B2A9E');
    gradient.addColorStop(1, '#20A4F3');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add glow effect
    ctx.shadowColor = 'rgba(123, 63, 242, 0.6)';
    ctx.shadowBlur = 60;

    // Draw title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 72px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 80, 200);

    // Draw subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '36px Inter, sans-serif';
    ctx.fillText(subtitle, 80, 270);

    // Draw domain
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText('LucyLounge.org', 80, 550);

    // Add referral code if provided
    if (referralCode && type === 'referral') {
      ctx.fillStyle = '#20A4F3';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(referralCode, 600, 400);
    }
  }, [title, subtitle, type, referralCode]);

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

// Export function to generate social share URL
export const generateSocialShareUrl = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp', url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  };

  return shareUrls[platform];
};
