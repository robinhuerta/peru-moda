"use client";

import { useState } from 'react';
import Image from 'next/image';

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 bg-brand-900 shadow-soft">
        <Image
          src={mainImage}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Placeholder for zoom functionality */}
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          {/* Zoom functionality will go here */}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 ${
              img === mainImage ? 'border-[#d12a18]' : 'border-white/10'
            } transition hover:border-[#d12a18]/40`}
            onClick={() => setMainImage(img)}
          >
            <Image
              src={img}
              alt={`${productName} - vista ${index + 1}`}
              fill
              className="object-cover"
              sizes="25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}