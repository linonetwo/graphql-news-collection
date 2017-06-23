/* @flow @ts-check */

import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';

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

    using: {
      type: GraphQLBoolean,
    },

    done: {
      type: GraphQLBoolean,
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
