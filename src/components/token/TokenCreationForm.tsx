'use client';

import { tokenFormSchema, type TokenFormData } from '@/lib/validation/tokenSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function TokenCreationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: '',
      symbol: '',
      decimals: 9,
      supply: '',
    },
  });

  const onSubmit = async (data: TokenFormData) => {
    try {
      // Will implement token creation logic in Phase 3
      console.log('Validated form data:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-200">
          Token Name
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          placeholder="My Token"
          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-200">
          Token Symbol
        </label>
        <input
          {...register('symbol')}
          type="text"
          id="symbol"
          placeholder="TKN"
          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.symbol ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.symbol && (
          <p className="text-sm text-red-500">{errors.symbol.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="decimals" className="block text-sm font-medium text-gray-200">
          Decimals
        </label>
        <select
          {...register('decimals', { valueAsNumber: true })}
          id="decimals"
          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.decimals ? 'border-red-500' : 'border-gray-700'
          }`}
        >
          {[0, 2, 4, 6, 8, 9].map(decimal => (
            <option key={decimal} value={decimal}>
              {decimal}
            </option>
          ))}
        </select>
        {errors.decimals && (
          <p className="text-sm text-red-500">{errors.decimals.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="supply" className="block text-sm font-medium text-gray-200">
          Initial Supply
        </label>
        <input
          {...register('supply')}
          type="text"
          id="supply"
          placeholder="1000000"
          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.supply ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.supply && (
          <p className="text-sm text-red-500">{errors.supply.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Token'}
      </button>
    </form>
  );
}
