type GetActiveImageIndexParams = {
  cursorX: number;
  containerLeft: number;
  containerWidth: number;
  imagesCount: number;
};

export function getActiveImageIndex({
  cursorX,
  containerLeft,
  containerWidth,
  imagesCount,
}: GetActiveImageIndexParams) {
  if (imagesCount <= 1) {
    return 0;
  }

  const relativeCursorX = cursorX - containerLeft;
  const sectionWidth = containerWidth / imagesCount;
  const index = Math.floor(relativeCursorX / sectionWidth);

  return Math.min(Math.max(index, 0), imagesCount - 1);
}