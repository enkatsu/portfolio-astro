export const LANG_KEYS = ['en', 'ja'] as const;
export type LangKey = (typeof LANG_KEYS)[number];
export const DEFAULT_LANG_KEY: LangKey = 'en';

/** Contentful のロケールコード */
export const CONTENTFUL_LOCALES: Record<LangKey, string> = {
  en: 'en-US',
  ja: 'ja',
};

/**
 * [...lang] ルート用の getStaticPaths
 * 英語はプレフィックスなし（/work/）、日本語は /ja/work/
 */
export const langStaticPaths = () => LANG_KEYS.map((lang) => ({
  params: { lang: lang === DEFAULT_LANG_KEY ? undefined : lang },
  props: { lang },
}));

/**
 * 言語プレフィックスを除いたパスを返す
 * 例: /ja/work/ -> /work/
 */
export const toBasePath = (pathname: string): string => {
  const pattern = new RegExp(`^/(${LANG_KEYS.filter((lang) => lang !== DEFAULT_LANG_KEY).join('|')})(?=/|$)`);
  return pathname.replace(pattern, '') || '/';
};

export const toLocalePath = (basePath: string, lang: LangKey): string => (
  lang === DEFAULT_LANG_KEY ? basePath : `/${lang}${basePath}`
);
