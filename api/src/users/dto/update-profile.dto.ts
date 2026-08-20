export type UpdateProfileDto = {
  nickname?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  phone?: string;
  currentAddress?: string | null;
  avatarId?: string | null;
};
