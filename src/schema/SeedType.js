/* @flow @ts-check */

import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';
import stories from './Story';

export default new GraphQLObjectType({
  name: 'Seed',
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    title: {
      type: new GraphQLNonNull(GraphQLString),
    },

    url: {
      type: GraphQLString,
    },

    type: {
      type: GraphQLString,
    },

    stories: {
      type: stories,
    },

    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.created_at;
      },
    },

    updatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.updated_at;
      },
    },
  },
});
