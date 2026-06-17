"use client";

// RF Telecom LB - UX/UI pass
import Image from "next/image";
import { useState } from "react";
import type { CatalogImage } from "@/lib/catalog";

export function ProductGallery({ images, name }: { images: CatalogImage[]; name: string }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-sm">
        <Image
          src={active.url}
          alt={active.alt || name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(image)}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-[var(--color-surface-2)] transition-all duration-200 hover:border-[var(--color-accent)] ${
                active.url === image.url ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
              }`}
              aria-label={`View ${image.alt || name}`}
            >
              <Image src={image.url} alt={image.alt || name} fill sizes="96px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
