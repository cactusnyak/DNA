import { useEffect, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

import { getCroppedAvatarFile } from './logic/get-cropped-avatar-file';

type AvatarCropModalProps = {
  file: File;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

export function AvatarCropModal({
  file,
  onClose,
  onConfirm,
}: AvatarCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area>();
  const [error, setError] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Не удалось прочитать выбранное изображение.');
    };
    reader.readAsDataURL(file);

    return () => reader.abort();
  }, [file]);

  async function handleConfirm() {
    if (!cropArea) return;

    setError(undefined);
    setIsProcessing(true);

    try {
      onConfirm(await getCroppedAvatarFile(file, cropArea));
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : 'Не удалось обрезать изображение.',
      );
      setIsProcessing(false);
    }
  }

  return (
    <Modal isOpen title="Обрезка аватара" size="md" onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-64 flex-1 bg-foreground sm:min-h-80">
          {imageUrl ? (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCropArea(pixels)}
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center text-sm text-white/70 sm:min-h-80">
              Загружаем изображение...
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-4 border-t border-border p-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Масштаб</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              aria-label="Масштаб изображения"
              className="w-full accent-primary"
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isProcessing}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              type="button"
              disabled={!cropArea || isProcessing}
              onClick={handleConfirm}
            >
              {isProcessing ? 'Подготавливаем...' : 'Применить'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
