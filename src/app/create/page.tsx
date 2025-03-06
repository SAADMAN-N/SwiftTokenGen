import { TokenCreationForm } from '@/components/token/TokenCreationForm';

export default function CreateTokenPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Token</h1>
      <TokenCreationForm />
    </div>
  );
}
