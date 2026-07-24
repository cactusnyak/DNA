import type { CSSProperties } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import { headerHeightVar } from '@/shared/header';
import { mobileNavigationHeightVar } from '@/shared/main-navigation';

import { Breadcrumbs } from '@/widgets/Breadcrumbs';
import { Footer } from '@/widgets/Footer/Footer';
import { Header } from '@/widgets/Header/Header';
import { MainNavigation } from '@/widgets/MainNavigation/MainNavigation';
import { CookieNotice } from '@/widgets/CookieNotice';

export function MainLayout() {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-background pb-[var(--main-layout-mobile-bottom-padding)] text-foreground md:pb-0"
      style={
        {
          '--main-layout-mobile-bottom-padding': mobileNavigationHeightVar(),
        } as CSSProperties
      }
    >
      <Header />

      <div style={{ marginTop: headerHeightVar() }}>
        <Breadcrumbs />

        <main className="mx-auto max-w-7xl px-4 py-8 pb-24">
          <Outlet />
        </main>
      </div>

      <Footer />

      <MainNavigation placement="mobileBottom" />

      <CookieNotice />

      <div
        id="app-modal-root"
        className="pointer-events-none fixed inset-0 z-[80]"
      />

      <div
        id="app-notification-root"
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-0"
      />

      <ScrollRestoration />
    </div>
  );
}
