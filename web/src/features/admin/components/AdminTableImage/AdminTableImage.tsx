import { ImageIcon } from 'lucide-react';

type AdminTableImageProps = {
  src?: string;
  alt: string;
};

export function AdminTableImage({ src, alt }: AdminTableImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="size-10 rounded-lg bg-muted object-cover"
      />
    );
  }

  return (
    <div
      className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
      aria-label={`Нет изображения: ${alt}`}
    >
      <ImageIcon className="size-4" aria-hidden="true" />
    </div>
  );
}
