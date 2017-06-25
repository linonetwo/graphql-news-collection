/* @flowtype @ts-check */
import 'whatwg-fetch';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import getGraphqlClient from './client/networkInterface';

global.fetch = fetch;

async function runCrawler() {
  const client = await getGraphqlClient();
  client.mutate({
    variables: {
      input: { clientMutationId: 'qwerasdf' },
    },
    mutation: gql`
      mutation useSeed($input: useSeedInput!) {
        useSeed(input: $input) {
          seed {
              id
              url
              type
              title
              using
              done
            }
          clientMutationId
        }
      }
    `,
  })
    .then(data => console.log(data))
    .catch(error => console.error(error));
}

runCrawler();
