import { Fragment, type ReactNode } from 'react';

const TOKEN_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+|t(?:elegram)?\.me\/[A-Za-z0-9_]+|@[A-Za-z0-9_]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\+?[\d\s\-\(\)]{6,}\d)/gi;

type ResourceLinkProps = {
  href: string;
  children: ReactNode;
};

function ResourceLink({ href, children }: ResourceLinkProps) {
  const isExternal = /^https?:/i.test(href);

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
    >
      {children}
    </a>
  );
}

const TELEGRAM_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:t(?:elegram)?\.me\/)?@?([A-Za-z0-9_]+)$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const SITE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:[A-Za-z0-9][-A-Za-z0-9]*\.)+[A-Za-z]{2,}(?:\/[^\s]*)?$/i;

function trimTrailingPunctuation(value: string): [string, string] {
  const punctuationMatch = value.match(/[.,;:!?]+$/);
  if (punctuationMatch) {
    const trailing = punctuationMatch[0];
    return [value.slice(0, -trailing.length), trailing];
  }

  if (value.endsWith(')')) {
    const open = value.split('').filter((c) => c === '(').length;
    const close = value.split('').filter((c) => c === ')').length;
    if (close > open) {
      return [value.slice(0, -1), ')'];
    }
  }

  return [value, ''];
}

function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '').length;
  if (digits < 7) return false;

  const hasPlus = value.includes('+');
  const hasGroupSeparator = /[() ]/.test(value);

  return hasPlus || hasGroupSeparator || digits >= 10;
}

function getPhoneHref(value: string): string {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function isTelegram(value: string): boolean {
  return TELEGRAM_REGEX.test(value);
}

function getTelegramHref(value: string): string {
  const match = value.match(TELEGRAM_REGEX);
  if (!match) return value;
  return `https://t.me/${match[1]}`;
}

function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function getEmailHref(value: string): string {
  return `mailto:${value}`;
}

function isSite(value: string): boolean {
  return SITE_REGEX.test(value);
}

function getSiteHref(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

function getContactLink(value: string, renderAsLink = true): ReactNode | null {
  let href: string | null = null;

  if (isPhone(value)) {
    href = getPhoneHref(value);
  } else if (isTelegram(value)) {
    href = getTelegramHref(value);
  } else if (isEmail(value)) {
    href = getEmailHref(value);
  } else if (isSite(value)) {
    href = getSiteHref(value);
  }

  if (!href) return null;

  if (!renderAsLink) {
    return (
      <span
        role="link"
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {value}
      </span>
    );
  }

  return <ResourceLink href={href}>{value}</ResourceLink>;
}

export function linkifyText(text: string, renderLinks = true): ReactNode {
  const parts: ReactNode[] = [];
  const regex = new RegExp(TOKEN_REGEX, 'gi');
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }

    const [core, trailing] = trimTrailingPunctuation(match[0]);
    const link = getContactLink(core, renderLinks);

    if (link) {
      parts.push(
        <Fragment key={`link-${keyIndex++}`}>{link}</Fragment>,
      );
    } else {
      parts.push(core);
    }

    if (trailing) {
      parts.push(trailing);
    }

    lastIndex = match.index + match[0].length;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter) {
    parts.push(textAfter);
  }

  return parts;
}

export function LinkifyText({
  text,
  renderLinks = true,
}: {
  text: string;
  renderLinks?: boolean;
}) {
  return <>{linkifyText(text, renderLinks)}</>;
}
