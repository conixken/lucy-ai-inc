import { SEOHead } from '@/components/seo/SEOHead';
import { Pricing as PricingSection } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ParallaxEnvironment } from '@/components/effects/ParallaxEnvironment';
import { RippleButton } from '@/components/ui/RippleButton';

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Lucy AI Pricing — Simple, Transparent Plans"
        description="Choose the perfect Lucy AI plan for your needs. Free forever plan available. Pro and Team plans with advanced features, unlimited usage, and priority support."
        keywords="Lucy AI pricing, AI assistant plans, free AI chat, pro AI features, team collaboration"
        canonical="https://lucylounge.org/pricing"
        image="/og-pricing.png"
        url="https://lucylounge.org/pricing"
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

          {/* Pricing Section */}
          <PricingSection />

          {/* FAQ Section */}
          <div className="py-12">
            <FAQ />
          </div>

          <Footer />
        </div>
      </ParallaxEnvironment>
    </>
  );
};

export default Pricing;
