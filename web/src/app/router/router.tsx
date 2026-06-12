import { Navigate, createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/app/layouts/MainLayout';

import { AdminPage } from '@/pages/admin/AdminPage';
import { AuthorizationPage } from '@/pages/authorization/AuthorizationPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CategoryPage } from '@/pages/category/CategoryPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { HomePage } from '@/pages/home/HomePage';
import { ProductPage } from '@/pages/product/ProductPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ReferralsPage } from '@/pages/referrals/ReferralsPage';

import {
  BREADCRUMB_TYPE,
  type BreadcrumbHandle,
} from '@/widgets/Breadcrumbs/types/breadcrumbs';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.HOME,
            label: 'Главная',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/catalog',
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.CATALOG,
            label: 'Каталог',
            href: '/catalog',
          },
        } satisfies BreadcrumbHandle,
        children: [
          {
            index: true,
            element: <CatalogPage />,
          },
          {
            path: '*',
            element: <CategoryPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.CATEGORY,
                fallbackLabel: 'Категория',
              },
            } satisfies BreadcrumbHandle,
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
          breadcrumb: {
            type: BREADCRUMB_TYPE.PRODUCT,
            fallbackLabel: 'Товар',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/cart',
        element: <CartPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Корзина',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/checkout',
        element: <CheckoutPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Оформление заказа',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/profile',
        element: <ProfilePage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Профиль',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/authorization',
        element: <AuthorizationPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Авторизация',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/referrals',
        element: <ReferralsPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Заработок',
          },
        } satisfies BreadcrumbHandle,
      },

      {
        path: '/admin',
        element: <AdminPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Админка',
          },
        } satisfies BreadcrumbHandle,
      },
    ],
  },
]);