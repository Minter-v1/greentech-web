const DEFAULT_PUBLIC_ORIGIN = "https://greentech.msp-g1.click";

export function createPublicUrl(pathname: string): URL {
  const origin = process.env.WEB_PUBLIC_ORIGIN?.trim() || DEFAULT_PUBLIC_ORIGIN;
  return new URL(pathname, origin);
}
