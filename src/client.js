/* @flowtype @ts-check */
import 'whatwg-fetch';
import fetch from 'node-fetch';
import ApolloClient from 'apollo-client';

import getGraphqlClient from './client/networkInterface';
import Seeds from './client/sagas/Seeds';
import Crawl from './client/sagas/Crawl';
import Stories from './client/sagas/Stories';

global.fetch = fetch;

async function runCrawler() {
  const client: ApolloClient = await getGraphqlClient()
    .catch((error) => {
      console.error(`Crawler init error: ${error}`);
      process.exit(0);
    });

  // let tasks start
  Seeds(client).catch(error => console.error(`Fatal error in Seed() : ${error}`));
  Crawl().catch(error => console.error(`Fatal error in Crawl() : ${error}`));
  Stories(client).catch(error => console.error(`Fatal error in Stories() : ${error}`));
}

runCrawler();
