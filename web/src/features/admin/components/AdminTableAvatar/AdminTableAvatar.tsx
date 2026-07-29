import { Avatar } from '@/components/ui/Avatar';

type AdminTableAvatarProps = {
  src?: string;
  name: string;
};

export function AdminTableAvatar({ src, name }: AdminTableAvatarProps) {
  return <Avatar src={src} name={name} size="sm" />;
}
