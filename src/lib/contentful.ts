import { createClient } from 'contentful';
import { marked } from 'marked';
import { CONTENTFUL_LOCALES, type LangKey } from './i18n';

const client = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN,
});

export type Link = { text: string; url: string };

// Contentful のフィールドはローカライズされていないと欠けることがあるので緩く扱う
type Fields = Record<string, any>;

const getEntries = async (lang: LangKey, contentType: string, order: string[]): Promise<Fields[]> => {
  const entries = await client.getEntries({
    content_type: contentType,
    locale: CONTENTFUL_LOCALES[lang],
    order: order as any,
    include: 2,
    limit: 1000,
  });
  return entries.items.map((item) => item.fields as Fields);
};

/** Markdown（Long text フィールド）を HTML に変換する */
export const markdown = (text?: string): string => (text ? marked.parse(text, { async: false }) : '');

const assetUrl = (asset: any): string | undefined => {
  const url = asset?.fields?.file?.url;
  return url ? (url.startsWith('//') ? `https:${url}` : url) : undefined;
};

/** Contentful Images API でリサイズした画像 URL */
export const imageUrl = (url: string, width: number, height: number): string => (
  `${url}?w=${width}&h=${height}&fit=fill&fm=webp`
);

const toLinks = (links?: any[]): Link[] => (links ?? [])
  .filter((link) => link?.fields)
  .map((link) => ({ text: link.fields.text, url: link.fields.url }));

/** YYYY-MM-DD... -> YYYY.MM.DD */
const formatDate = (date?: string): string => (date ? date.slice(0, 10).replaceAll('-', '.') : '');

export const getProjects = async (lang: LangKey) => (
  (await getEntries(lang, 'project', ['-fields.year'])).map((fields) => ({
    title: fields.title as string,
    year: fields.year as number,
    thumbnailUrl: assetUrl(fields.thumbnail),
    collaboratorsHtml: markdown(fields.collaborators),
    abstractHtml: markdown(fields.abstruct),
    links: toLinks(fields.links),
  }))
);

export const getPublications = async (lang: LangKey) => (
  (await getEntries(lang, 'publication', ['-fields.year'])).map((fields) => ({
    title: fields.title as string,
    author: fields.auther as string,
    year: fields.year as number,
    publisher: fields.publisher as string | undefined,
    pdfUrl: assetUrl(fields.pdf),
  }))
);

export const getExhibitions = async (lang: LangKey) => (
  (await getEntries(lang, 'exhibition', ['-fields.startDate'])).map((fields) => ({
    title: fields.title as string,
    gallery: fields.gallery as string,
    startDate: formatDate(fields.startDate),
    endDate: formatDate(fields.endDate),
    links: toLinks(fields.links),
  }))
);

export const getWorkshops = async (lang: LangKey) => (
  (await getEntries(lang, 'workshop', ['-fields.startDate'])).map((fields) => ({
    title: fields.title as string,
    venue: fields.venue as string,
    startDate: formatDate(fields.startDate),
    endDate: formatDate(fields.endDate),
  }))
);

export const getAwards = async (lang: LangKey) => (
  (await getEntries(lang, 'award', ['-fields.year'])).map((fields) => ({
    name: fields.name as string,
    prize: fields.prize as string,
    year: fields.year as number,
  }))
);

export const getBiography = async (lang: LangKey) => {
  const [fields] = await getEntries(lang, 'biography', ['sys.createdAt']);
  return {
    name: fields.name as string,
    job: fields.job as string,
    email: fields.email as string,
    text: fields.text as string,
    textHtml: markdown(fields.text),
    iconUrl: assetUrl(fields.icon),
  };
};
