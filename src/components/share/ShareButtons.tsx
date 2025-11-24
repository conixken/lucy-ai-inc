import { Facebook, Twitter, Linkedin, MessageCircle, Share2 } from 'lucide-react';
import { RippleButton } from '../ui/RippleButton';
import { generateSocialShareUrl } from '../social/SocialShareCard';
import { HolographicCard } from '../ui/HolographicCard';
import { useSoundSystem } from '@/hooks/useSoundSystem';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
}

export const ShareButtons = ({ 
  url = 'https://lucylounge.org',
  title = 'Lucy AI — Your Intelligent Digital Companion',
  description = 'Experience the future of AI with Lucy'
}: ShareButtonsProps) => {
  const { playClickSound } = useSoundSystem();

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp') => {
    playClickSound();
    const shareUrl = generateSocialShareUrl(platform, url, `${title} - ${description}`);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    playClickSound();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <HolographicCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-accent" />
        Share Lucy AI
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RippleButton
          variant="outline"
          className="flex flex-col items-center gap-2 h-20"
          onClick={() => handleShare('facebook')}
        >
          <Facebook className="w-6 h-6" />
          <span className="text-sm">Facebook</span>
        </RippleButton>

        <RippleButton
          variant="outline"
          className="flex flex-col items-center gap-2 h-20"
          onClick={() => handleShare('twitter')}
        >
          <Twitter className="w-6 h-6" />
          <span className="text-sm">Twitter</span>
        </RippleButton>

        <RippleButton
          variant="outline"
          className="flex flex-col items-center gap-2 h-20"
          onClick={() => handleShare('linkedin')}
        >
          <Linkedin className="w-6 h-6" />
          <span className="text-sm">LinkedIn</span>
        </RippleButton>

        <RippleButton
          variant="outline"
          className="flex flex-col items-center gap-2 h-20"
          onClick={() => handleShare('whatsapp')}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm">WhatsApp</span>
        </RippleButton>
      </div>

      {navigator.share && (
        <RippleButton
          variant="gradient"
          className="w-full mt-4"
          onClick={handleNativeShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share via...
        </RippleButton>
      )}
    </HolographicCard>
  );
};
