import { Outlet } from 'react-router-dom';

import { Breadcrumbs } from '@/widgets/Breadcrumbs';
import { Footer } from '@/widgets/Footer/Footer';
import { Header } from '@/widgets/Header/Header';
import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';

export function MainLayout() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Header />

      <Breadcrumbs />

      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-8 pb-24">
        <Outlet />
      </main>

      <Footer />

      <MainNavigation placement="mobileBottom" />

      <div
        id="app-modal-root"
        className="pointer-events-none fixed inset-0 z-[80]"
      />

      <div
        id="app-notification-root"
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-0"
      />
    </div>
  );
}