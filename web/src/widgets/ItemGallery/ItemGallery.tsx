import { useRef, useState } from 'react';

import type { Image } from '@/shared/types/image';

const SWIPE_THRESHOLD = 2;

type ItemGalleryProps = {
  images: Image[];
  title: string;
};

function getActiveImageIndex(
  cursorX: number,
  containerLeft: number,
  containerWidth: number,
  imagesCount: number,
): number {
  if (imagesCount <= 1) return 0;
  const sectionWidth = containerWidth / imagesCount;
  const index = Math.floor((cursorX - containerLeft) / sectionWidth);
  return Math.min(Math.max(index, 0), imagesCount - 1);
}

export function ItemGallery({ images, title }: ItemGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const activeImage = images[activeIndex] ?? images[0];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveIndex(
      getActiveImageIndex(e.clientX, rect.left, rect.width, images.length),
    );
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartXRef.current === null || images.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    setActiveIndex((prev) =>
      delta < 0
        ? Math.min(prev + 1, images.length - 1)
        : Math.max(prev - 1, 0),
    );
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((image, index) => (
        <img
          key={image.url}
          src={image.url}
          alt={image.alt ?? title}
          className={[
            'absolute inset-0 size-full object-cover transition-opacity duration-150',
            index === activeIndex ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      ))}

      {images.length > 1 && (
        <div className="w-fit h-fit absolute bottom-3 left-3 right-3 flex gap-1">
          {images.map((_, index) => (
            <span
              key={index}
              className={[
                'w-3 h-0.5 flex-1 rounded-full transition-colors',
                index === activeIndex ? 'bg-foreground' : 'bg-background/70',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
