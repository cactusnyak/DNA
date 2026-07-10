import { useState } from 'react';

import type { Image } from '@/shared/types/image';

type AdGalleryProps = {
  images: Image[];
  title: string;
};

function getActiveImageIndex(
  cursorX: number,
  containerLeft: number,
  containerWidth: number,
  imagesCount: number,
) {
  if (imagesCount <= 1) return 0;
  const section = containerWidth / imagesCount;
  const index = Math.floor((cursorX - containerLeft) / section);
  return Math.min(Math.max(index, 0), imagesCount - 1);
}

export function AdGallery({ images, title }: AdGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex] ?? images[0];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveIndex(getActiveImageIndex(e.clientX, rect.left, rect.width, images.length));
  }

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Нет фото
      </div>
    );
  }

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveIndex(0)}
    >
      <img
        src={activeImage.url}
        alt={activeImage.alt ?? title}
        className="size-full object-cover"
        loading="lazy"
      />

      {images.length > 1 && (
        <div className="absolute bottom-3 left-3 right-3 flex gap-1">
          {images.map((_, index) => (
            <span
              key={index}
              className={[
                'h-1 flex-1 rounded-full transition-colors',
                index === activeIndex ? 'bg-foreground' : 'bg-background/70',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
