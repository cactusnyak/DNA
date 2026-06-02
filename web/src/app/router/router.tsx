import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/app/layouts/MainLayout';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AuthorizationPage } from '@/pages/authorization/AuthorizationPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProductPage } from '@/pages/product/ProductPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ReferralsPage } from '@/pages/referrals/ReferralsPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/catalog',
        element: <CatalogPage />,
      },
      {
        path: '/product/:productId',
        element: <ProductPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/referrals',
        element: <ReferralsPage />,
      },
      {
        path: '/authorization',
        element: <AuthorizationPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
    ],
  },
]);