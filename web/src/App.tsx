import { RouterProvider } from 'react-router-dom';
import { AuthCapabilitiesProvider } from '@/entities/auth';
import { QueryProvider } from './app/providers/QueryProvider';
import { router } from './app/router/router';

export default function App() {
  return (
    <QueryProvider>
      <AuthCapabilitiesProvider>
        <RouterProvider router={router} />
      </AuthCapabilitiesProvider>
    </QueryProvider>
  );
}