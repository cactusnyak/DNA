import {
  Navigate,
  createBrowserRouter,
  useParams,
} from 'react-router-dom';

import { MainLayout } from '@/app/layouts/MainLayout';

import { AdCreatePage } from '@/pages/ads/AdCreatePage';
import { AdDetailsPage } from '@/pages/ads/AdDetailsPage';
import { AdEditPage } from '@/pages/ads/AdEditPage';
import { AdsMyPage } from '@/pages/ads/AdsMyPage';
import { AdsPage } from '@/pages/ads/AdsPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AuthorizationPage } from '@/pages/authorization/AuthorizationPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { CategoryPage } from '@/pages/category/CategoryPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { CheckoutResultPage } from '@/pages/checkout/CheckoutResultPage';
import { FavouritesPage } from '@/pages/favourites/FavouritesPage';
import { HomePage } from '@/pages/home/HomePage';
import { MarketPage } from '@/pages/market/MarketPage';
import { ProductPage } from '@/pages/product/ProductPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ReferralsPage } from '@/pages/referrals/ReferralsPage';
import { SellerPage } from '@/pages/seller/SellerPage';
import { LegalDocumentPage } from '@/features/legal';
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

const legalRoutes = [
  { path: '/legal-details', label: 'Юридическая информация' },
  { path: '/public-offer', label: 'Публичная оферта' },
  { path: '/terms', label: 'Пользовательское соглашение' },
  { path: '/privacy-policy', label: 'Политика обработки персональных данных' },
  { path: '/personal-data-consent', label: 'Согласие на обработку персональных данных' },
  { path: '/personal-data-publication-consent', label: 'Согласие на распространение персональных данных' },
  { path: '/returns', label: 'Правила возврата и отмены заказа' },
  { path: '/referral-program-rules', label: 'Правила партнёрской программы' },
  { path: '/ad-posting-rules', label: 'Правила размещения объявлений' },
  { path: '/cookie-policy', label: 'Политика использования cookie и локального хранения' },
  { path: '/payment-and-delivery', label: 'Оплата и доставка' },
  { path: '/contacts', label: 'Контакты' },
  { path: '/about', label: 'О платформе DNA' },
] as const;

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
                label: 'Каталог Доски',
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
          {
            path: 'my/:adId/edit',
            element: <AdEditPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.STATIC,
                label: 'Редактирование объявления',
              },
            } satisfies BreadcrumbHandle,
          },
          {
            path: 'new',
            element: <AdCreatePage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.STATIC,
                label: 'Новое объявление',
              },
            } satisfies BreadcrumbHandle,
          },
          {
            path: 'ad/:adSlug',
            element: <AdDetailsPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.AD,
                fallbackLabel: 'Объявление',
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
                label: 'Каталог Маркета',
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
            path: 'seller',
            element: <SellerPage />,
            handle: {
              breadcrumb: {
                type: BREADCRUMB_TYPE.STATIC,
                label: 'Аккаунт продавца',
              },
            } satisfies BreadcrumbHandle,
          },
          {
            path: 'product/:productSlug',
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
        path: '/favourites',
        element: <FavouritesPage />,
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
        path: '/checkout/result',
        element: <CheckoutResultPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: 'Результат оплаты',
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
      ...legalRoutes.map((route) => ({
        path: route.path,
        element: <LegalDocumentPage />,
        handle: {
          breadcrumb: {
            type: BREADCRUMB_TYPE.STATIC,
            label: route.label,
          },
        } satisfies BreadcrumbHandle,
      })),
    ],
  },
]);
