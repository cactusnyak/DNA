export function buildReferralLink(referralCode?: string) {
  if (!referralCode) {
    return '';
  }

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : '';

  return `${origin}/authorization?ref=${encodeURIComponent(referralCode)}`;
}