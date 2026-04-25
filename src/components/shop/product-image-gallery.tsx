"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  altText: string | null;
}

export function ProductImageGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square w-full rounded-xl bg-muted" aria-hidden="true" />
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={`/api/media/${images[active].url}`}
          alt={images[active].altText ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === active ? "border-primary" : "border-transparent hover:border-muted-foreground"
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
