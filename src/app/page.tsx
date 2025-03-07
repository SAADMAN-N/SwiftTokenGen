import { TokenCreationForm } from '@/components/token/TokenCreationForm';
import { PricingCalculator } from '@/components/ui/PricingCalculator';
import { MemecoinsDisplay } from '@/components/token/MemecoinsDisplay';
import { WalletConnectionStatus } from '@/components/WalletConnectionStatus';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      {/* Wallet Connection Status */}
      <div className="mb-8 text-center">
        <WalletConnectionStatus />
      </div>

      {/* Token Creation Section */}
      <section className="mb-16">
        <h1 className="text-3xl font-bold text-center mb-8">Create Your Solana Token</h1>
        
        {/* Pricing Calculator */}
        <div className="mb-12">
          <PricingCalculator />
        </div>

        {/* Token Creation Form */}
        <TokenCreationForm />
      </section>

      {/* Memecoins Display Section */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Created Memecoins</h2>
        <MemecoinsDisplay />
      </section>
    </div>
  );
}
