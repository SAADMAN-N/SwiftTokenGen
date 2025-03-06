import { TokenCreationForm } from '@/components/token/TokenCreationForm';
import { PricingCalculator } from '@/components/ui/PricingCalculator';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Solana Token</h1>
      
      {/* Pricing Calculator */}
      <div className="mb-12">
        <PricingCalculator />
      </div>

      {/* Token Creation Form */}
      <TokenCreationForm />
    </div>
  );
}
