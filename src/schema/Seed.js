/* @flow @ts-check */

import validator from 'validator';
import { has } from 'lodash';
import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLInt } from 'graphql';
import {
  fromGlobalId,
  connectionDefinitions,
  forwardConnectionArgs,
  connectionFromArraySlice,
  cursorToOffset,
  mutationWithClientMutationId,
} from 'graphql-relay';

import db from '../db';
import SeedType from './SeedType';
import ValidationError from './ValidationError';

export const seeds = {
  type: connectionDefinitions({
    name: 'Seed',
    nodeType: SeedType,
    connectionFields: {
      totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    },
  }).connectionType,
  args: forwardConnectionArgs,
  async resolve(root, args) {
    const limit = typeof args.first === 'undefined' ? '10' : args.first;
    const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

    const [data, totalCount] = await Promise.all([
      db.table('seeds')
        .orderBy('created_at', 'desc')
        .limit(limit).offset(offset)
        .then(rows => rows.map(x => Object.assign(x, { __type: 'Seed' }))),
      db.table('seeds')
        .count().then(x => x[0].count),
    ]);

    return {
      ...connectionFromArraySlice(data, args, {
        sliceStart: offset,
        arrayLength: totalCount,
      }),
      totalCount,
    };
  },
};

const inputFields = {
  parentId: {
    type: GraphQLID,
  },
  title: {
    type: GraphQLString,
  },
  type: {
    type: GraphQLString,
  },
  url: {
    type: GraphQLString,
  },
};

const outputFields = {
  seed: {
    type: SeedType,
  },
};

function validate(input, { t, user }) {
  const errors = [];
  const data = {};

  if (!user) {
    throw new ValidationError([{ key: '', message: t('Only authenticated users can create seeds.') }]);
  }

  if (typeof input.title === 'undefined' || input.title.trim() === '') {
    errors.push({ key: 'title', message: t('The title field cannot be empty.') });
  } else if (!validator.isLength(input.title, { min: 3, max: 80 })) {
    errors.push({ key: 'title', message: t('The title field must be between 3 and 80 characters long.') });
  } else {
    data.title = input.title;
  }

  if (typeof input.url !== 'undefined' && input.url.trim() !== '') {
    if (!validator.isLength(input.url, { max: 200 })) {
      errors.push({ key: 'url', message: t('The URL field cannot be longer than 200 characters long.') });
    } else if (!validator.isURL(input.url)) {
      errors.push({ key: 'url', message: t('The URL is invalid.') });
    } else {
      data.url = input.url;
    }
  }

  // List 类型是可以直接爬里面的列表，每个列表就是一篇文章，Explore 是需要搜索的，BFS 那样
  if (typeof input.type !== 'undefined' && input.type.trim() !== '') {
    if (!has({ List: true, Explore: true }, input.type)) {
      errors.push({ key: 'type', message: t('The type field must be "List" or "Explore" .') });
    } else {
      data.type = input.type;
    }
  }

  // BFS 时，这个东西的来源，一般是由另一个种子爬到的，当然，没有就拉倒
  data.parent_id = input.parentId;

  return { data, errors };
}

export const createSeed = mutationWithClientMutationId({
  name: 'CreateSeed',
  inputFields,
  outputFields,
  async mutateAndGetPayload(input, context) {
    const { data, errors } = validate(input, context);

    if (errors.length) {
      throw new ValidationError(errors);
    }

    const rows = await db.table('seeds').insert(data).returning('id');
    return context.seeds.load(rows[0]).then(seed => ({ seed }));
  },
});

async function updateField(input, context, field: string) {
  const { t, user } = context;
  const { type, id } = fromGlobalId(input.id);

  if (!user) {
    throw new ValidationError([{ key: '', message: t('Only authenticated users can done seeds.') }]);
  }
  if (type !== 'Seed') {
    throw new Error(t('The seed ID is invalid.'));
  }

  const row = await db.table('seeds').where('id', '=', id).first('*');
  if (!row) {
    throw new ValidationError([{ key: '', message: 'Failed to done this seed. Please make sure that seed id exists.' }]);
  }

  await db.table('seeds').where('id', '=', id).update({ updated_at: db.raw('CURRENT_TIMESTAMP'), [field]: true });
  await context.seeds.clear(id);
  return context.seeds.load(id).then(x => ({ seed: x }));
}

export const useSeed = mutationWithClientMutationId({
  name: 'useSeed',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields,
  async mutateAndGetPayload(input, context) {
    return updateField(input, context, 'using');
  },
});

export const doneSeed = mutationWithClientMutationId({
  name: 'doneSeed',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields,
  mutateAndGetPayload(input, context) {
    return updateField(input, context, 'done');
  },
});
