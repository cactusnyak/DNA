import { useState } from 'react';

import type { Image } from '@/shared/types/image';

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
      <div className="flex aspect-[4/3] w-full max-w-2xl items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Нет изображения
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-2 sm:flex-row h-fit md:rounded-3xl md:bg-white md:p-2 md:shadow-card-2xl">
      {images.length > 1 && (
        <div className="order-2 flex w-full gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-[32rem] sm:w-16 sm:shrink-0 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto sm:pb-0">
          {images.map((image, index) => {
            const isActive = index === activeImageIndex;

            return (
              <button
                key={image.id}
                type="button"
                className={[
                  'size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-muted transition-colors sm:size-16 sm:rounded-xl',
                  isActive
                    ? 'border-foreground'
                    : 'border-border hover:border-foreground/40',
                ].filter(Boolean).join(' ')}
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
        className="relative order-1 aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-muted sm:order-2 sm:max-h-[32rem] sm:rounded-2xl sm:cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          aria-hidden="true"
          src={activeImage.url}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-xl"
        />

        <img
          src={activeImage.url}
          alt={activeImage.alt ?? title}
          className="relative size-full object-contain transition-transform duration-200"
          style={{
            transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
        />
      </div>
    </div>
  );
}
