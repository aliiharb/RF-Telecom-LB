"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroPhoto = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
};

type HeroPhotoSwitcherProps = {
  photos: HeroPhoto[];
};

export function HeroPhotoSwitcher({ photos }: HeroPhotoSwitcherProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  if (!photos.length) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-white shadow-[0_18px_54px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[28/9]">
        {photos.map((photo, index) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className={`transition-opacity duration-700 ease-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            } ${photo.fit === "contain" ? "object-contain" : "object-cover"}`}
          />
        ))}
      </div>
      {photos.length > 1 ? (
        <div className="absolute bottom-4 left-4 flex gap-2" aria-hidden="true">
          {photos.map((photo, index) => (
            <span
              key={`${photo.src}-indicator`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-black/25"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
