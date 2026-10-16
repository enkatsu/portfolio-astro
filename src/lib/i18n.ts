export const LANG_KEYS = ['en', 'ja'] as const;
export type LangKey = (typeof LANG_KEYS)[number];
export const DEFAULT_LANG_KEY: LangKey = 'en';

/** Contentful locale codes */
export const CONTENTFUL_LOCALES: Record<LangKey, string> = {
  en: 'en-US',
  ja: 'ja',
};

/**
 * getStaticPaths for [...lang] routes
 * English has no prefix (/work/), Japanese uses /ja/work/
 */
export const langStaticPaths = () => LANG_KEYS.map((lang) => ({
  params: { lang: lang === DEFAULT_LANG_KEY ? undefined : lang },
  props: { lang },
}));

/**
 * Return the path without the language prefix
 * e.g. /ja/work/ -> /work/
 */
export const toBasePath = (pathname: string): string => {
  const pattern = new RegExp(`^/(${LANG_KEYS.filter((lang) => lang !== DEFAULT_LANG_KEY).join('|')})(?=/|$)`);
  return pathname.replace(pattern, '') || '/';
};

export const toLocalePath = (basePath: string, lang: LangKey): string => (
  lang === DEFAULT_LANG_KEY ? basePath : `/${lang}${basePath}`
);
