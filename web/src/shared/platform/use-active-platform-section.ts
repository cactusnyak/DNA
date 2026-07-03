import { useLocation } from 'react-router-dom';

import {
  getPlatformSection,
  getPlatformSectionIdFromPathname,
} from './platform-sections';

export function useActivePlatformSection() {
  const { pathname } = useLocation();
  const activeSectionId = getPlatformSectionIdFromPathname(pathname);
  const activeSection = getPlatformSection(activeSectionId);

  return {
    activeSectionId,
    activeSection,
  };
}
