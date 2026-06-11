import { useState } from 'react';

import type { Image } from '@/shared/types/image';
import { cn } from '@/shared/utils/cn';

import { getActiveGalleryImage } from './logic/get-active-gallery-image';

type ProductDetailsGalleryProps = {
  images: Image[];
  title: string;
};

export function ProductDetailsGallery({
  images,
  title,
}: ProductDetailsGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });
  const [isZoomed, setIsZoomed] = useState(false);

  const activeImage = getActiveGalleryImage(images, activeImageIndex);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    setZoomPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Нет изображения
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="overflow-hidden rounded-2xl bg-card"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage.url}
          alt={activeImage.alt ?? title}
          className="aspect-square w-full object-contain transition-transform duration-200"
          style={{
            transform: isZoomed ? 'scale(1.65)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
          {images.map((image, index) => {
            const isActive = index === activeImageIndex;

            return (
              <button
                key={image.id}
                type="button"
                className={cn(
                  'overflow-hidden rounded-lg border bg-card transition-colors',
                  isActive
                    ? 'border-foreground'
                    : 'border-border hover:border-foreground/40',
                )}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? title}
                  className="aspect-square w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}