'use client';

import { useState } from 'react';

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
}

export function TokenCreationForm() {
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    decimals: 9, // Default for most Solana tokens
    supply: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement token creation logic in Phase 3
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-200">
          Token Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="My Token"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-200">
          Token Symbol
        </label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          placeholder="TKN"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          maxLength={11}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="decimals" className="block text-sm font-medium text-gray-200">
          Decimals
        </label>
        <select
          id="decimals"
          name="decimals"
          value={formData.decimals}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {[0, 2, 4, 6, 8, 9].map(decimal => (
            <option key={decimal} value={decimal}>
              {decimal}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="supply" className="block text-sm font-medium text-gray-200">
          Initial Supply
        </label>
        <input
          type="number"
          id="supply"
          name="supply"
          value={formData.supply}
          onChange={handleChange}
          placeholder="1000000"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          min="0"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
      >
        Create Token
      </button>
    </form>
  );
}