import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const srcRoot = path.join(root, 'src');
const outputRoot = path.join(root, 'audit');

const routeByPage = new Map([
  ['pages/home/HomePage.tsx', '/'],
  ['pages/ads/AdsPage.tsx', '/ads'],
  ['pages/catalog/CatalogPage.tsx', '/ads/catalog, /market/catalog'],
  ['pages/category/CategoryPage.tsx', '/ads/catalog/*, /market/catalog/*'],
  ['pages/ads/AdsMyPage.tsx', '/ads/my'],
  ['pages/ads/AdEditPage.tsx', '/ads/my/:adId/edit'],
  ['pages/ads/AdCreatePage.tsx', '/ads/new'],
  ['pages/ads/AdDetailsPage.tsx', '/ads/ad/:adSlug'],
  ['pages/market/MarketPage.tsx', '/market'],
  ['pages/seller/SellerPage.tsx', '/market/seller'],
  ['pages/product/ProductPage.tsx', '/market/product/:productSlug'],
  ['pages/favourites/FavouritesPage.tsx', '/favourites'],
  ['pages/favorites/FavoritesPage.tsx', 'не подключена к роутеру (legacy-файл)'],
  ['pages/cart/CartPage.tsx', '/cart'],
  ['pages/checkout/CheckoutPage.tsx', '/checkout'],
  ['pages/checkout/CheckoutResultPage.tsx', '/checkout/result'],
  ['pages/profile/ProfilePage.tsx', '/profile'],
  ['pages/authorization/AuthorizationPage.tsx', '/authorization'],
  ['pages/referrals/ReferralsPage.tsx', '/referrals'],
  ['pages/admin/AdminPage.tsx', '/admin'],
]);

const routePatterns = [
  /^\/$/, /^\/ads$/, /^\/ads\/catalog(?:\/.*)?$/, /^\/ads\/my$/,
  /^\/ads\/my\/[^/]+\/edit$/, /^\/ads\/new$/, /^\/ads\/ad\/[^/]+$/,
  /^\/market$/, /^\/market\/catalog(?:\/.*)?$/, /^\/market\/seller$/,
  /^\/market\/product\/[^/]+$/, /^\/catalog(?:\/.*)?$/,
  /^\/categories(?:\/.*)?$/, /^\/product\/[^/]+$/, /^\/favourites$/,
  /^\/cart$/, /^\/checkout$/, /^\/checkout\/result$/, /^\/profile$/,
  /^\/authorization$/, /^\/referrals$/, /^\/admin$/,
];

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|html)$/.test(entry.name)) files.push(full);
  }
}
walk(srcRoot);
files.push(path.join(root, 'index.html'));

function clean(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function expressionText(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map((span) => `\${${span.expression.getText()}}${span.literal.text}`).join('');
  }
  return null;
}

function isLikelyUiText(value) {
  const text = clean(value);
  if (!text) return false;
  return /[А-Яа-яЁё]/.test(text) || /^(Telegram|WhatsApp|MAX|Email|ID|OAuth|DNA)$/i.test(text);
}

const textItems = [];
const linkItems = [];

for (const file of files) {
  const sourceText = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JSX,
  );
  const rel = path.relative(srcRoot, file).replaceAll(path.sep, '/').replace(/^\.\.\//, '');

  function addText(node, value, kind) {
    const text = clean(value);
    if (!isLikelyUiText(text)) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    textItems.push({ file: rel, line: line + 1, text, kind });
  }

  function addLink(node, value, mechanism) {
    const link = clean(value);
    if (!link || (!link.startsWith('/') && !link.startsWith('#') && !/^(https?:|mailto:|tel:)/.test(link))) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    linkItems.push({ file: rel, line: line + 1, link, mechanism });
  }

  function visit(node) {
    if (ts.isJsxText(node)) addText(node, node.text, 'JSX-текст');

    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(source);
      if (ts.isStringLiteral(node.initializer)) {
        if (/^(href|to)$/.test(name)) addLink(node, node.initializer.text, `атрибут ${name}`);
        if (/^(placeholder|title|alt|aria-label|label|description)$/.test(name)) {
          addText(node, node.initializer.text, `атрибут ${name}`);
        }
      }
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        const value = expressionText(node.initializer.expression);
        if (value && /^(href|to)$/.test(name)) addLink(node, value, `атрибут ${name}`);
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(source).replace(/^['"]|['"]$/g, '');
      const value = expressionText(node.initializer);
      if (value) {
        if (/^(href|to)$/.test(name)) addLink(node, value, `поле ${name}`);
        addText(node, value, `поле ${name}`);
      }
    }

    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'navigate') {
      const arg = node.arguments[0];
      const value = arg && expressionText(arg);
      if (value) addLink(node, value, 'navigate()');
    }

    if (ts.isStringLiteralLike(node) && !ts.isPropertyAssignment(node.parent)) {
      addText(node, node.text, 'строковый литерал');
    }

    if (ts.isTemplateExpression(node)) {
      const staticText = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('{…}');
      addText(node, staticText, 'шаблонная строка');
    }

    ts.forEachChild(node, visit);
  }
  visit(source);
}

const uniqueTexts = [...new Map(textItems.map((item) => [`${item.file}:${item.line}:${item.text}`, item])).values()]
  .sort((a, b) => a.file.localeCompare(b.file, 'ru') || a.line - b.line);

function sectionFor(item) {
  if (routeByPage.has(item.file)) return `URL: ${routeByPage.get(item.file)} — ${item.file}`;
  if (item.file.startsWith('app/') || item.file.startsWith('widgets/Header/') || item.file.startsWith('widgets/Footer/') || item.file.startsWith('widgets/MainNavigation/') || item.file.startsWith('shared/header/')) {
    return `Глобальный интерфейс (все страницы) — ${item.file}`;
  }
  if (item.file.startsWith('features/admin/') || item.file.startsWith('entities/admin/')) return `URL: /admin — ${item.file}`;
  if (item.file.startsWith('features/authorization/') || item.file.startsWith('entities/auth/')) return `URL: /authorization — ${item.file}`;
  if (item.file.startsWith('features/checkout/') || item.file.startsWith('entities/order/')) return `URL: /checkout и /checkout/result — ${item.file}`;
  if (item.file.startsWith('features/profile/') || item.file.startsWith('entities/user/')) return `URL: /profile — ${item.file}`;
  if (item.file.startsWith('features/referrals/') || item.file.startsWith('entities/referral/')) return `URL: /referrals — ${item.file}`;
  if (item.file.includes('/ads/') || item.file.startsWith('entities/ad') || item.file.startsWith('widgets/Ads') || item.file.startsWith('widgets/Ad')) return `Раздел /ads — ${item.file}`;
  if (item.file.includes('/market/') || item.file.startsWith('entities/product') || item.file.startsWith('widgets/Product') || item.file.startsWith('widgets/Catalog')) return `Раздел /market — ${item.file}`;
  return `Общие компоненты / несколько URL — ${item.file}`;
}

let textReport = `АУДИТ ТЕКСТА САЙТА DNA\nДата: ${new Date().toISOString().slice(0, 10)}\n\n`;
textReport += 'Область проверки: статический пользовательский текст frontend-приложения web/src, включая страницы, общие компоненты, UX-состояния, ошибки, placeholder, aria-label и тексты админки. Динамический контент из API (названия товаров, категорий, объявлений, данные пользователей) перечислить заранее невозможно. Строки сопровождаются исходным файлом и строкой для последующей правки.\n\n';
textReport += 'Статус бизнес-функций на момент аудита: создание заказа доступно; онлайн-оплата и доставка находятся в разработке; реферальный код, ссылка и дерево приглашений доступны; кешбэк, реферальные начисления, ставки, пополнение и вывод средств не запущены. Формулировки с неподтверждёнными сроками и конкретными ставками исключены.\n\n';
let currentSection = '';
for (const item of uniqueTexts) {
  const section = sectionFor(item);
  if (section !== currentSection) {
    textReport += `\n=== ${section} ===\n`;
    currentSection = section;
  }
  textReport += `- ${item.text}  [строка ${item.line}; ${item.kind}]\n`;
}
textReport += `\nИТОГО: ${uniqueTexts.length} текстовых вхождений.\n`;

const uniqueLinks = [...new Map(linkItems.map((item) => [`${item.file}:${item.line}:${item.link}`, item])).values()]
  .sort((a, b) => a.link.localeCompare(b.link, 'ru') || a.file.localeCompare(b.file, 'ru') || a.line - b.line);

function linkStatus(link) {
  if (link === '#') return ['НЕ ЗАПОЛНЕНА', 'пустая ссылка-заглушка'];
  if (/^\/legal(?:\/|$)/.test(link)) return ['БИТАЯ / СТРАНИЦА НЕ СОЗДАНА', 'маршрут /legal отсутствует в router.tsx'];
  if (link === 'mailto:hello@dna.local') return ['ЗАГЛУШКА', 'технический домен .local'];
  if (link === 'tel:+70000000000') return ['ЗАГЛУШКА', 'нулевой тестовый номер'];
  if (link === '/favicon.svg') return ['РАБОЧАЯ', 'файл существует в web/public'];
  if (/^https?:/.test(link)) return [link.includes('${') ? 'ВНЕШНЯЯ ДИНАМИЧЕСКАЯ' : 'ВНЕШНЯЯ', 'адрес формируется из данных; доступность зависит от внешнего ресурса'];
  if (/^(mailto:|tel:)/.test(link)) return ['КОНТАКТНАЯ', 'формат ссылки корректен'];
  const sample = link
    .replace(/\$\{[^}]+\}/g, 'dynamic')
    .replace(/:[A-Za-z][\w-]*/g, 'dynamic')
    .replace(/\*.*$/, 'dynamic');
  return routePatterns.some((pattern) => pattern.test(sample))
    ? [link.includes('${') || link.includes(':') || link.includes('*') ? 'ДИНАМИЧЕСКАЯ / МАРШРУТ ЕСТЬ' : 'РАБОЧАЯ', 'соответствует маршруту приложения']
    : ['ТРЕБУЕТ ПРОВЕРКИ', 'статический анализ не подтвердил маршрут'];
}

let linkReport = `АУДИТ ССЫЛОК САЙТА DNA\nДата: ${new Date().toISOString().slice(0, 10)}\n\n`;
linkReport += 'Статусы определены по конфигурации React Router и исходному коду. Динамические ссылки проверены по шаблону маршрута; существование конкретного товара, объявления или категории зависит от данных API.\n\n';
const problemLinks = uniqueLinks.filter((item) => !['РАБОЧАЯ', 'ДИНАМИЧЕСКАЯ / МАРШРУТ ЕСТЬ', 'КОНТАКТНАЯ', 'ВНЕШНЯЯ', 'ВНЕШНЯЯ ДИНАМИЧЕСКАЯ'].includes(linkStatus(item.link)[0]));
linkReport += '=== НЕЗАПОЛНЕННЫЕ, БИТЫЕ И ПОДОЗРИТЕЛЬНЫЕ ССЫЛКИ ===\n';
for (const item of problemLinks) {
  const [status, note] = linkStatus(item.link);
  linkReport += `- [${status}] ${item.link} — ${note}; ${item.file}:${item.line} (${item.mechanism})\n`;
}
linkReport += '\n=== ВСЕ ССЫЛКИ В ИСХОДНОМ КОДЕ ===\n';
for (const item of uniqueLinks) {
  const [status, note] = linkStatus(item.link);
  linkReport += `- [${status}] ${item.link} — ${note}; ${item.file}:${item.line} (${item.mechanism})\n`;
}
linkReport += `\nИТОГО: ${uniqueLinks.length} вхождений ссылок; проблемных/подозрительных: ${problemLinks.length}.\n`;
linkReport += '\nДополнительно: ссылки, формируемые функциями getCategoryHref/getPlatformProductHref и данными API, не имеют фиксированного URL в исходнике. Их шаблоны соответствуют /ads/catalog/*, /market/catalog/*, /ads/ad/:slug и /market/product/:slug. Текстовые URL в пользовательском контенте автоматически превращаются в внешние ссылки через shared/utils/linkify.tsx и зависят от данных API.\n';

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, 'all-site-text.txt'), textReport);
fs.writeFileSync(path.join(outputRoot, 'all-site-links.txt'), linkReport);

console.log(`Created ${uniqueTexts.length} text entries and ${uniqueLinks.length} link entries in ${outputRoot}`);
