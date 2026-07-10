import { useState } from 'react';

import type { Image } from '@/shared/types/image';
import { cn } from '@/shared/utils/cn';

type GalleryProps = {
  images: Image[];
  title: string;
};

function getActiveGalleryImage(images: Image[], activeIndex: number) {
  return images[activeIndex] ?? images[0];
}

export function Gallery({ images, title }: GalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
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
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Нет изображения
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex w-16 shrink-0 flex-col gap-2">
          {images.map((image, index) => {
            const isActive = index === activeImageIndex;

            return (
              <button
                key={image.id}
                type="button"
                className={cn(
                  'size-16 overflow-hidden rounded-xl border transition-colors cursor-pointer',
                  isActive
                    ? 'border-foreground'
                    : 'border-border hover:border-foreground/40',
                )}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt ?? title}
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <div
        className="aspect-[4/3] flex-1 overflow-hidden rounded-2xl border border-border bg-muted cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage.url}
          alt={activeImage.alt ?? title}
          className="size-full object-cover transition-transform duration-200"
          style={{
            transform: isZoomed ? 'scale(1.65)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        />
      </div>
    </div>
  );
}
