/* @flowtype @ts-check */
import 'whatwg-fetch';
import fetch from 'node-fetch';
import getGraphqlClient from './client/networkInterface';
import Seeds from './client/Seeds';
import Crawl from './client/Crawl';
import Stories from './client/Stories';

global.fetch = fetch;

async function runCrawler() {
  const client = await getGraphqlClient();

  // let tasks start
  Seeds(client);
  Crawl();
  Stories(client);
}

runCrawler();
