/* @flow @ts-check */
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';
import { seeds } from './channels';

async function useSeed(client: ApolloClient) {
  const { data: { useSeed: { seed } } } = await client.mutate({
    variables: {
      input: {},
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
        }
      }
    `,
  });

  return seed;
}

export default async function Seeds(client: ApolloClient) {
  const firstSeed = await useSeed(client);
  // resolves when it is taken by crawler
  await seeds.put(firstSeed);
  // TODO: record usage info here, preventing frequently fetching same site.
}
