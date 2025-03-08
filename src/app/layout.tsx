import { ClientLayout } from '@/components/layout/ClientLayout';
import './globals.css';
import { PromotionalBanner } from '@/components/ui/PromotionalBanner';
import { Analytics } from '@vercel/analytics/next';

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
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
