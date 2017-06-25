/* @flow @ts-check */
import { seeds } from './channels';

import type { Story } from './types';

async function getStory(url: string): Story {

}

export default async function Crawl() {
  const seed = await seeds.take();
  console.log(getStory(seed.url));
}
