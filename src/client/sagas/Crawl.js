/* @flow @ts-check */
import { seeds, stories } from '../channels';

import type { Story } from '../types';

async function getStory(url: string): Story {
  console.log(await fetch(url));
  return { title: '请问人情味儿', text: '阿萨德发生大幅', url: 'http://fakeurl111.com', clientMutationId: 'qwerasdf' };
}

export default async function Crawl() {
  const seed = await seeds.take();
  const story = await getStory(seed.url);
  // Put in channel and directly get next seed
  stories.put(story);
}
