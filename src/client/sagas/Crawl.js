/* @flow @ts-check */
import HeadlessChrome from 'simple-headless-chrome';
import read from 'read-art';
import { seeds, stories } from '../channels';

import type { Story } from '../types';

async function getStory(url: string): Story {
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

  // for detailed selector , try https://github.com/Tjatse/node-readability/wiki/Handbook#example-2
  const article = await read(html);
  return { title: article.title, text: article.content, url, clientMutationId: 'qwerasdf' };
}

export default async function Crawl() {
  while (true) {
    const seed = await seeds.take();
    const story = await getStory(seed.url);
    // Put in channel and directly get next seed
    stories.put(story);
    if (process.env.NODE_ENV !== 'production') break;
  }
}
