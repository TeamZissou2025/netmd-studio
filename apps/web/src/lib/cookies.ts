const ONE_YEAR = 365 * 24 * 60 * 60;

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, maxAge = ONE_YEAR) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function getConsent(): string | null {
  return getCookie('netmd_consent');
}

export function setConsent(value: 'accepted' | 'declined') {
  setCookie('netmd_consent', value);
}

export function getWaitlistCookie(): string | null {
  return getCookie('netmd_waitlist');
}

export function setWaitlistCookie() {
  if (getConsent() === 'accepted') {
    setCookie('netmd_waitlist', 'subscribed');
  }
}
