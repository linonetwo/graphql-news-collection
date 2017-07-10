/* @flow @ts-check */
import HeadlessChrome from 'simple-headless-chrome';
import read from 'read-art';
import { seeds, stories } from '../channels';

import type { Story } from '../types';

function validLink(ele) {
  if (!ele.uri || !ele.title) {
    return false;
  }
  /**
   * must be:
   * 1. uri must have 4 digital at least
   * 2. uri can not be a bitmap
   * 3. uri can not have no path
   * 4. length of title must greater than 5
   */
  let qsi;
  let uri = ele.uri;
  if ((qsi = uri.indexOf('?')) > 0) {
    uri = uri.substr(0, qsi);
  }
  return uri.match(/\d{4,}/i) && !uri.match(/\.(jpg|png|jpeg|pdf)/i) && uri.indexOf('/') !== uri.length - 1 && ele.title.length >= 5;
}

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

  const { result: { value: html } } = await browser.evaluate((selector) => {
    const selectorHtml = document.querySelector(selector);
    return selectorHtml.innerHTML;
  }, 'html');

  if (!html) return Promise.reject(`no HTML in ${url}`);

  // for detailed selector , try https://github.com/Tjatse/node-readability/wiki/Handbook#example-2
  const article = await read(html);
  return { title: article.title, text: article.content, url, clientMutationId: 'qwerasdf' };
}

export default async function Crawl() {
  const seed = await seeds.take();
  const story = await getStory(seed.url);
  // Put in channel and directly get next seed
  stories.put(story);
}
