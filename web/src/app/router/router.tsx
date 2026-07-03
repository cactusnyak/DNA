import {
  Navigate,
  createBrowserRouter,
  useParams,
} from 'react-router-dom';

import { MainLayout } from '@/app/layouts/MainLayout';

import { AdsMyPage } from '@/pages/ads/AdsMyPage';
import { AdsPage } from '@/pages/ads/AdsPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AuthorizationPage } from '@/pages/authorization/AuthorizationPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CategoryPage } from '@/pages/category/CategoryPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { FavoritesPage } from '@/pages/favorites/FavoritesPage';
import { HomePage } from '@/pages/home/HomePage';
import { MarketPage } from '@/pages/market/MarketPage';
import { ProductPage } from '@/pages/product/ProductPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ReferralsPage } from '@/pages/referrals/ReferralsPage';
import {
  PLATFORM_SECTION,
  platformSections,
} from '@/shared/platform';

import {
  BREADCRUMB_TYPE,
  type BreadcrumbHandle,
} from '@/widgets/Breadcrumbs/types/breadcrumbs';

function LegacyCatalogRedirect() {
  const { '*': categoryPath } = useParams();
  const normalizedCategoryPath = categoryPath
    ?.split('/')
    .filter(Boolean)
    .join('/');

  return (
    <Navigate
      to={
        normalizedCategoryPath
          ? `/market/catalog/${normalizedCategoryPath}`
          : '/market/catalog'
      }
      replace
    />
  );
}

function LegacyProductRedirect() {
  const { productId } = useParams();

  return (
    <Navigate
      to={productId ? `/market/product/${productId}` : '/market/catalog'}
      replace
    />
  );
}

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
        path: '/ads',
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: platformSections.ads.label,
            href: platformSections.ads.href,
          },
        } satisfies BreadcrumbHandle,
        children: [
          {
            index: true,
            element: <AdsPage />,
          },
          {
            path: 'catalog',
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.CATALOG,
                label: 'Каталог',
                href: platformSections.ads.catalogHref,
              },
            } satisfies BreadcrumbHandle,
            children: [
              {
                index: true,
                element: <CatalogPage section={PLATFORM_SECTION.ADS} />,
              },
              {
                path: '*',
                element: <CategoryPage section={PLATFORM_SECTION.ADS} />,
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
            path: 'my',
            element: <AdsMyPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.STATIC,
                label: 'Мои объявления',
              },
            } satisfies BreadcrumbHandle,
          },
        ],
      },

      {
        path: '/market',
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: platformSections.market.label,
            href: platformSections.market.href,
          },
        } satisfies BreadcrumbHandle,
        children: [
          {
            index: true,
            element: <MarketPage />,
          },
          {
            path: 'catalog',
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.CATALOG,
                label: 'Каталог',
                href: platformSections.market.catalogHref,
              },
            } satisfies BreadcrumbHandle,
            children: [
              {
                index: true,
                element: <CatalogPage section={PLATFORM_SECTION.MARKET} />,
              },
              {
                path: '*',
                element: <CategoryPage section={PLATFORM_SECTION.MARKET} />,
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
            path: 'product/:productId',
            element: <ProductPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.PRODUCT,
                fallbackLabel: 'Товар',
              },
            } satisfies BreadcrumbHandle,
          },
        ],
      },

      {
        path: '/catalog/*',
        element: <LegacyCatalogRedirect />,
      },

      {
        path: '/categories/*',
        element: <LegacyCatalogRedirect />,
      },

      {
        path: '/product/:productId',
        element: <LegacyProductRedirect />,
      },


      {
        path: '/favorites',
        element: <FavoritesPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Избранное',
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
