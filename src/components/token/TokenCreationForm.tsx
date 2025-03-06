
'use client';

import { tokenFormSchema, type TokenFormData } from '@/lib/validation/tokenSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

export function TokenCreationForm() {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: '',
      symbol: '',
      decimals: 9,
      supply: '',
      description: '',
      creatorName: '',
      creatorEmail: '',
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
      tags: [],
      logoFile: undefined,
    },
  });

  const handleAddTag = () => {
    if (newTag && tags.length < 5 && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleImageSelect = (file: File) => {
    setValue('logoFile', file);
  };

  const onSubmit = async (data: TokenFormData) => {
    try {
      // Will implement token creation logic in Phase 3
      console.log('Validated form data:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Basic Token Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Basic Token Information</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Token Logo
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              error={errors.logoFile?.message}
            />
          </div>

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

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              placeholder="Describe your token..."
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Right Column - Advanced Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Advanced Options</h2>

          <div className="space-y-2">
            <label htmlFor="creatorName" className="block text-sm font-medium text-gray-200">
              Creator Name
            </label>
            <input
              {...register('creatorName')}
              type="text"
              id="creatorName"
              placeholder="Your Name"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.creatorName ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.creatorName && (
              <p className="text-sm text-red-500">{errors.creatorName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="creatorEmail" className="block text-sm font-medium text-gray-200">
              Creator Email
            </label>
            <input
              {...register('creatorEmail')}
              type="email"
              id="creatorEmail"
              placeholder="your@email.com"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.creatorEmail ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.creatorEmail && (
              <p className="text-sm text-red-500">{errors.creatorEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Social Links</label>
            <div className="space-y-4">
              <input
                {...register('website')}
                type="url"
                placeholder="Website URL"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.website ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              <input
                {...register('twitter')}
                type="url"
                placeholder="Twitter URL"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.twitter ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              <input
                {...register('telegram')}
                type="url"
                placeholder="Telegram URL"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.telegram ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              <input
                {...register('discord')}
                type="url"
                placeholder="Discord URL"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.discord ? 'border-red-500' : 'border-gray-700'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Tags (max 5)
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-600 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-xs hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tags.length >= 5}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Create Token
        </button>
      </div>
    </form>
  );
}
