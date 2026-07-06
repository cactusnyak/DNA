export async function uploadAdImage(accessToken: string, file: File) {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch('/api/ads/uploads/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed with status ${response.status}`);
  }

  return response.json() as Promise<{ url: string; fileName: string }>;
}
