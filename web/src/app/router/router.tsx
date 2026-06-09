import { Navigate, createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/app/layouts/MainLayout';

import { HomePage } from '@/pages/home/HomePage';

import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CategoryPage } from '@/pages/category/CategoryPage';
import { ProductPage } from '@/pages/product/ProductPage';

import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';

import { ProfilePage } from '@/pages/profile/ProfilePage';
import { AuthorizationPage } from '@/pages/authorization/AuthorizationPage';

import { ReferralsPage } from '@/pages/referrals/ReferralsPage';

import { AdminPage } from '@/pages/admin/AdminPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
        handle: {
          breadcrumb: 'Главная',
        },
      },

      {
        path: '/catalog',
        handle: {
          breadcrumb: 'Каталог',
        },
        children: [
          {
            index: true,
            element: <CatalogPage />,
          },
          {
            path: '*',
            element: <CategoryPage />,
            handle: {
              breadcrumb: 'Категория',
            },
          },
        ],
      },

      {
        path: '/categories',
        element: <Navigate to="/catalog" replace />,
      },

      {
        path: '/product/:productId',
        element: <ProductPage />,
        handle: {
          breadcrumb: 'Товар',
        },
      },

      {
        path: '/cart',
        element: <CartPage />,
        handle: {
          breadcrumb: 'Корзина',
        },
      },

      {
        path: '/checkout',
        element: <CheckoutPage />,
        handle: {
          breadcrumb: 'Оформление заказа',
        },
      },

      {
        path: '/profile',
        element: <ProfilePage />,
        handle: {
          breadcrumb: 'Профиль',
        },
      },

      {
        path: '/authorization',
        element: <AuthorizationPage />,
        handle: {
          breadcrumb: 'Авторизация',
        },
      },

      {
        path: '/referrals',
        element: <ReferralsPage />,
        handle: {
          breadcrumb: 'Заработок',
        },
      },

      {
        path: '/admin',
        element: <AdminPage />,
        handle: {
          breadcrumb: 'Админка',
        },
      },
    ],
  },
]);