/* @flow @ts-check */
import gql from 'graphql-tag';
import ApolloClient from 'apollo-client';

import { stories } from '../channels';

import type { Story } from '../types';


async function createStory(client: ApolloClient, story: Story) {
  await client.mutate({
    variables: {
      storyInput: { ...story, seedId: undefined },
      seedId: story.seedId,
    },
    mutation: gql`
      mutation createStory($storyInput: CreateStoryInput!, $seedId: ID!) {
        createStory(input: $storyInput) {
          story {
            id
            author {
              id
              displayName
            }
            title
          }
        }
        doneSeed(input: {id: $seedId, clientMutationId: "qwerasdf"}) {
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
  });
}

export default async function Stories(client: ApolloClient) {
  while (true) {
    const story = await stories.take();
    await createStory(client, story);
    console.log(`Story ${story.title} sent to server.`);
    if (process.env.NODE_ENV !== 'production') break;
  }
}
