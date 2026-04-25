"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  altText: string | null;
}

export function ProductImageGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) {
    return <div className="aspect-[4/5] w-full rounded-lg bg-parchment" aria-hidden="true" />;
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-lg bg-parchment"
        onClick={() => setZoomed((z) => !z)}
      >
        <Image
          src={`/api/media/${images[active].url}`}
          alt={images[active].altText ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-500 ${
            zoomed ? "scale-125" : "group-hover:scale-105"
          }`}
          priority
        />
        <div className="absolute right-3 top-3 rounded-full bg-cream/80 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4 text-warm-gray" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => { setActive(i); setZoomed(false); }}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                i === active
                  ? "border-gold shadow-xs"
                  : "border-transparent hover:border-sand/70"
              }`}
            >
              <Image
                src={`/api/media/${img.url}`}
                alt={img.altText ?? name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
