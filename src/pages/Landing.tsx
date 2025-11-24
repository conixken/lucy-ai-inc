import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { QuickActionLauncher } from '@/components/daily/QuickActionLauncher';
import { UsageStreak } from '@/components/daily/UsageStreak';
import { ShareButtons } from '@/components/share/ShareButtons';
import { ParallaxEnvironment } from '@/components/effects/ParallaxEnvironment';
import { useAmbientIntelligence } from '@/hooks/useAmbientIntelligence';

const Landing = () => {
  const navigate = useNavigate();
  const { themeMode } = useAmbientIntelligence();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/chat');
      }
    });
  }, [navigate]);

  return (
    <>
      <SEOHead 
        title="Lucy AI — Your Intelligent Digital Companion"
        description="Chat, explore, learn, create. Lucy AI is your next-generation personal AI companion built entirely on Lovable Cloud. Experience advanced AI reasoning, vision, memory, and creativity."
        keywords="Lucy AI, AI assistant, digital companion, artificial intelligence, chat AI, personal AI, AI chatbot, intelligent assistant, LucyLounge"
        canonical="https://lucylounge.org"
        image="/og-default.png"
        url="https://lucylounge.org"
        type="website"
      />
      
      <ParallaxEnvironment mode={themeMode} intensity={0.5}>
        <div className="min-h-screen relative">
          <Hero />
          
          {/* Quick Actions & Engagement Section */}
          <section className="relative z-10 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <QuickActionLauncher />
                <UsageStreak />
              </div>
              <ShareButtons />
            </div>
          </section>
          
          <Features />
          <Pricing />
          <FAQ />
          <Footer />
        </div>
      </ParallaxEnvironment>
    </>
  );
};

export default Landing;
