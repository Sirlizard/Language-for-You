import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TranslationSection } from "@/components/premium-translation/TranslationSection";
import { VoiceOverSection } from "@/components/premium-translation/VoiceOverSection";

const PremiumTranslation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <div className="space-y-8">
          {/* Translation Section */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">Premium Translation</h1>
            <p className="mb-8 text-gray-600">
              This feature is for a simple AI translation meant for only premium users.
            </p>
            <TranslationSection />
          </Card>

          <Separator />

          {/* Voice Over Section */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">Premium Voice Over</h1>
            <p className="mb-8 text-gray-600">
              Convert your text into natural-sounding speech in multiple languages.
            </p>
            <VoiceOverSection />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumTranslation;