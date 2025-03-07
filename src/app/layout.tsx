import { ClientLayout } from '@/components/layout/ClientLayout';
import './globals.css';
import { PromotionalBanner } from '@/components/ui/PromotionalBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-900 text-gray-100">
        <PromotionalBanner />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
