import { Navigate, useLocation } from 'react-router-dom';

import { legalDocumentsByPath } from '@/shared/legal';
import { LegalDocumentLayout } from './components/LegalDocumentLayout';

export function LegalDocumentPage() {
  const { pathname } = useLocation();
  const document = legalDocumentsByPath.get(pathname);

  if (!document) return <Navigate to="/" replace />;

  return <LegalDocumentLayout document={document} />;
}

