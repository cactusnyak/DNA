import { useLocation } from 'react-router-dom';

import {
  getPlatformSection,
  getPlatformSectionIdFromPathname,
} from './platform-sections';

export function useActivePlatformSection() {
  const location = useLocation();
  const sectionId = getPlatformSectionIdFromPathname(location.pathname);

  return getPlatformSection(sectionId);
}
