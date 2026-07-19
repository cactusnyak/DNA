import { httpClient } from '@/shared/api/http-client';

export type UploadUserAvatarResponse = {
  id: string;
  url: string;
  fileName: string;
};

export function uploadUserAvatar(
  accessToken: string,
  file: File,
): Promise<UploadUserAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient<UploadUserAvatarResponse>('/users/me/avatar', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData as unknown as Record<string, never>,
  });
}
