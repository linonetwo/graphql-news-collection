/* @flow @ts-check */
import HeadlessChrome from 'simple-headless-chrome';
import read from 'read-art';
import { seeds, stories, newLinks } from '../channels';

import type { Story } from '../types';

function decideType() {

}

// 下载一个 URL 对应的页面，获得 HTML 以及页面中所有的链接
export async function getPage(url: string): Story {
  const browser = new HeadlessChrome({
    headless: true,
    launchChrome: false,
    chrome: {
      host: 'localhost',
      port: 9222,
      remote: true,
    },
    browserlog: true,
  });
  await browser.init();
  await browser.goTo(url);

  const { result: { value: html } } = await browser.evaluate(() => document.querySelector('html').innerHTML);
  const { result: { value: allLinksInPage } } = await browser.evaluate(() => [...document.querySelectorAll('a')].map(link => ({ url: link.href, title: link.innerHTML })));

  if (!html) return Promise.reject(`no HTML in ${url}`);

  // Decide type:
  // if parent is List, this page will be Story, and link start from this page will be Explore
  return { type: 'Explore', url, links: allLinksInPage, clientMutationId: 'qwerasdf' };
}

// 精炼得到的 HTML，得到正文部分
export async function getContent(html: string): string {
  // for detailed selector , try https://github.com/Tjatse/node-readability/wiki/Handbook#example-2
  const article = await read(html);
  return { title: article.title, text: article.content };
}

export default async function Crawl() {
  while (true) {
    const seed = await seeds.take();
    const { links, html } = await getPage(seed.url);
    // Put in channel and directly get next seed
    const story = await getContent(html);
    stories.put({ ...story, seedId: seed.id });
    newLinks.put(links);
    if (process.env.NODE_ENV !== 'production') break;
  }
}
