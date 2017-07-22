/* @flow @ts-check */
import HeadlessChrome from 'simple-headless-chrome';
import read from 'read-art';
import { seeds, stories, newLinks } from '../channels';

import type { Story } from '../types';

function decideType() {

}

async function getHTMLandLinks(browser) {
  // get HTML and Links
  const { result: { value: html } } = await browser.evaluate(() => document.querySelector('html').innerHTML);
  const { result: { value: allLinksInPage } } = await browser.evaluate(() => [...document.querySelectorAll('a')].map(link => ({ url: link.href, title: link.innerHTML })));
  return { html, allLinksInPage };
}

export async function getStory(url: string): Story {
  // Connect Headless Chrome
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

  const { html, allLinksInPage } = await getHTMLandLinks(browser);
  if (!html) return Promise.reject(`no HTML in ${url}`);

  // get content from HTML, by readability
  // for detailed selector , try https://github.com/Tjatse/node-readability/wiki/Handbook#example-2
  const article = await read(html);

  // Decide type:
  // if parent is List, this page will be Story, and link start from this page will be Explore
  return { type: 'Explore', title: article.title, text: article.content, url, links: allLinksInPage, clientMutationId: 'qwerasdf' };
}

export default async function Crawl() {
  while (true) {
    const seed = await seeds.take();
    const { links, ...story } = await getStory(seed.url);
    // Put in channel and directly get next seed
    stories.put({ ...story, seedId: seed.id });
    newLinks.put(links);
    if (process.env.NODE_ENV !== 'production') break;
  }
}
