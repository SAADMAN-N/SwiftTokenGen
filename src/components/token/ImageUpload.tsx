'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  error?: string;
}

export function ImageUpload({ onImageSelect, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageSelect(file);

      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50/5' : 'border-gray-700'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={preview}
              alt="Token logo preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop a logo, or click to select'}
            </p>
            <p className="text-xs text-gray-400">
              PNG or JPG (max 5MB)
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}