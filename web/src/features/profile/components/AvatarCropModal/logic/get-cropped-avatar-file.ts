import type { Area } from 'react-easy-crop';

const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.9;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось прочитать изображение.'));
    image.src = source;
  });
}

export async function getCroppedAvatarFile(file: File, cropArea: Area) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Обрезка изображения не поддерживается браузером.');
    }

    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error('Не удалось подготовить изображение.')),
        'image/jpeg',
        AVATAR_QUALITY,
      );
    });

    return new File([blob], 'avatar.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
