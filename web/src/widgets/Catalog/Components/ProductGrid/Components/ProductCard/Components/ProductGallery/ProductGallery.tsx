import { useState } from 'react';

import type { Image } from '@/shared/types/image';

import { getActiveImageIndex } from './logic/get-active-image-index';

type ProductGalleryProps = {
  images: Image[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex] ?? images[0];

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const container = event.currentTarget.getBoundingClientRect();

    const nextIndex = getActiveImageIndex({
      cursorX: event.clientX,
      containerLeft: container.left,
      containerWidth: container.width,
      imagesCount: images.length,
    });

    setActiveImageIndex(nextIndex);
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center bg-muted text-sm text-muted-foreground">
        Нет изображения
      </div>
    );
  }

  return (
    <div
      className="relative aspect-square overflow-hidden bg-muted rounded-lg"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveImageIndex(0)}
    >
      <img
        src={activeImage.url}
        alt={activeImage.alt ?? title}
        className="h-full w-full object-cover"
      />

      {images.length > 1 && (
        <div className="absolute right-3 bottom-3 left-3 flex gap-1">
          {images.map((image, index) => (
            <span
              key={image.id}
              className={[
                'h-1 flex-1 rounded-full transition-colors',
                index === activeImageIndex ? 'bg-foreground' : 'bg-background/70',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}