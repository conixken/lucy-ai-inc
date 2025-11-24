import { SEOHead } from '@/components/seo/SEOHead';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Twitter, Linkedin, Facebook, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdvancedLucyAvatar } from '@/components/avatar/AdvancedLucyAvatar';
import { ParallaxEnvironment } from '@/components/effects/ParallaxEnvironment';
import { HolographicCard } from '@/components/ui/HolographicCard';
import { RippleButton } from '@/components/ui/RippleButton';
import { ShareButtons } from '@/components/share/ShareButtons';

const Launch = () => {
  const navigate = useNavigate();

  const launchStats = [
    { label: 'Upvotes', value: '1,250+' },
    { label: 'Comments', value: '340+' },
    { label: 'Daily Active Users', value: '10K+' },
    { label: 'Rating', value: '4.9★' }
  ];

  return (
    <>
      <SEOHead 
        title="Lucy AI Launch — Join the AI Revolution"
        description="Be part of Lucy AI's public launch. Experience next-generation AI with advanced reasoning, vision, memory, and creativity. Try free today!"
        keywords="Lucy AI launch, AI product launch, new AI assistant, AI revolution"
        canonical="https://lucylounge.org/launch"
        image="/og-launch.png"
        url="https://lucylounge.org/launch"
      />
      
      <ParallaxEnvironment mode="cosmic" intensity={0.5}>
        <div className="min-h-screen relative">
          {/* Header */}
          <div className="container mx-auto px-4 py-8">
            <RippleButton
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </RippleButton>
          </div>

          {/* Hero Section */}
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="inline-block px-6 py-2 bg-accent/20 backdrop-blur-lg border border-accent/30 text-white rounded-full font-semibold mb-8 animate-pulse-glow">
              🚀 Now Live!
            </div>

            <div className="flex justify-center mb-6">
              <AdvancedLucyAvatar size="xl" state="excited" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow-strong">
              Lucy AI is Live! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 text-shadow-soft">
              Join thousands experiencing the future of AI conversation
            </p>

            {/* Launch Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              {launchStats.map((stat, index) => (
                <HolographicCard key={index} className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-button bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </HolographicCard>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <RippleButton
                size="lg"
                variant="gradient"
                onClick={() => navigate('/auth')}
              >
                Try Lucy AI Free
              </RippleButton>
              <RippleButton
                size="lg"
                variant="outline"
                onClick={() => window.open('https://www.producthunt.com/posts/lucy-ai', '_blank')}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View on Product Hunt
              </RippleButton>
            </div>
          </div>

          {/* Screenshots Section */}
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center text-shadow-strong">
              See Lucy AI in Action
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <HolographicCard className="p-4">
                <img 
                  src="/og-default.png" 
                  alt="Lucy AI Chat Interface"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <h3 className="font-semibold text-white mb-2">Advanced Chat Interface</h3>
                <p className="text-sm text-white/70">Real-time streaming with beautiful UI</p>
              </HolographicCard>

              <HolographicCard className="p-4">
                <img 
                  src="/og-thinking.png" 
                  alt="Lucy AI Features"
                  className="w-full h-auto rounded-lg mb-4"
                />
                <h3 className="font-semibold text-white mb-2">Intelligent Thinking</h3>
                <p className="text-sm text-white/70">Advanced reasoning and problem-solving</p>
              </HolographicCard>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
              <ShareButtons 
                url="https://lucylounge.org/launch"
                title="Lucy AI is Live!"
                description="Experience the future of AI with Lucy — Your Intelligent Digital Companion"
              />
            </div>
          </div>

          <Footer />
        </div>
      </ParallaxEnvironment>
    </>
  );
};

export default Launch;
