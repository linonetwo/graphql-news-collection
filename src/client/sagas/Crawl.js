/* @flow @ts-check */
import HeadlessChrome from 'simple-headless-chrome';
import { seeds, stories } from '../channels';

import type { Story } from '../types';

async function getStory(url: string): Story {
  const browser = new HeadlessChrome({
    headless: true,
    launchChrome: false,
    chrome: {
      host: 'localhost',
      port: 9222,
      remote: true
    },
    browserlog: true
  });
  await browser.init();
  await browser.goTo(url);
  return { title: '请问人情味儿', text: '阿萨德发生大幅', url: 'http://fakeurl111.com', clientMutationId: 'qwerasdf' };
}

export default async function Crawl() {
  const seed = await seeds.take();
  const story = await getStory(seed.url);
  // Put in channel and directly get next seed
  stories.put(story);
}
