/* @flow @ts-check */
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';
import { seeds, newLinks } from '../channels';

import type NewLink from '../types';

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

async function createSeed(client: ApolloClient, aNewLink: NewLink) {
  const { data: { useSeed: { seed } } } = await client.mutate({
    variables: {
      input: aNewLink,
    },
    mutation: gql`
      mutation createSeed($title: string!, $type: string!, $url: string!) {
        createSeed(input: {title: $title, type: $type, url: $url, clientMutationId: "qwerasdf"}) {
          seed {
              id
              parentId
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
  });

  return seed;
}

async function getSeeds(client: ApolloClient) {
  while (true) {
    const seedFromServer = await useSeed(client);
  // resolves when it is taken by crawler
    await seeds.put(seedFromServer);
  // TODO: record usage info here, preventing frequently fetching same site.
    if (process.env.NODE_ENV !== 'production') break;
  }
}


function validLink(link: NewLink) {
  if (!link.uri || !link.title) {
    return false;
  }
  /**
   * must be:
   * 1. uri
   * 2. uri can not be a bitmap
   * 3. uri can not have no path
   * 4. length of title must greater than 1
   */
  let uri = link.uri;
  const queryString = uri.indexOf('?');
  if (queryString > 0) {
    uri = uri.substr(0, queryString);
  }
  return uri.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i)
      && !uri.match(/\.(jpg|png|jpeg|pdf)/i)
      && uri.indexOf('/') !== uri.length - 1
      && link.title.length >= 1;
}

async function saveSeeds(client: ApolloClient) {
  while (true) {
    const aNewLink: NewLink = await newLinks.take();
    if (validLink(aNewLink)) {
      await createSeed(client, aNewLink);
    }
    if (process.env.NODE_ENV !== 'production') break;
  }
}

export default async function Seeds(client: ApolloClient) {
  return Promise.all([
    getSeeds(client),
    saveSeeds(client),
  ]);
}
