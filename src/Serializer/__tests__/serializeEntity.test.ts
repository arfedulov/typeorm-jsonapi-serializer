import * as JSONAPI from 'jsonapi-typescript';
import assert from 'assert';

import { serializeEntity } from '../serializeEntity';

test('serializeEntity(): serialize entity with id only', async () => {
  const INSTANCE = { id: 123 };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {},
    exclude: [],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with attributes', async () => {
  const INSTANCE = {
    id: 123,
    firstName: 'Ivan',
    lastName: 'Petrov',
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {},
    exclude: [],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with skipped attributes', async () => {
  const INSTANCE = {
    id: 123,
    password: 'secret',
    firstName: 'Ivan',
    lastName: 'Petrov',
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {},
    exclude: [ 'password' ],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with relationships', async () => {
  const INSTANCE = {
    id: 123,
    firstName: 'Ivan',
    lastName: 'Petrov',
    articles: [{ id: 0, title: 'A', content: 'asdasdsadsd' }],
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      articles: {
        data: [{ id: '0', type: 'articles' }],
      },
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {
      articles: 'articles',
    },
    exclude: [],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with lazy relationships', async () => {
  const INSTANCE = {
    id: 123,
    firstName: 'Ivan',
    lastName: 'Petrov',
    articles: Promise.resolve([{ id: 0, title: 'A', content: 'asdasdsadsd' }]),
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      articles: {
        data: [{ id: '0', type: 'articles' }],
      },
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {
      articles: 'articles',
    },
    exclude: [],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with skipped relationships', async () => {
  const INSTANCE = {
    id: 123,
    firstName: 'Ivan',
    lastName: 'Petrov',
    secretFriends: [{ id: 5, name: 'Masha' }],
    articles: [{ id: 0, title: 'A', content: 'asdasdsadsd' }],
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      articles: {
        data: [{ id: '0', type: 'articles' }],
      },
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {
      articles: 'articles',
    },
    exclude: [ 'secretFriends' ],
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('serializeEntity(): serialize entity with skipped lazy relationships', async () => {
  const INSTANCE = {
    id: 123,
    firstName: 'Ivan',
    lastName: 'Petrov',
    secretFriends: Promise.resolve([{ id: 5, name: 'Masha' }]),
    articles: [{ id: 0, title: 'A', content: 'asdasdsadsd' }],
  };

  const EXPECT: JSONAPI.ResourceObject = {
    id: '123',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      articles: {
        data: [{ id: '0', type: 'articles' }],
      },
    },
  };

  const actual = await serializeEntity('stuff', INSTANCE, {
    relationshipsTypes: {
      articles: 'articles',
    },
    exclude: [ 'secretFriends' ],
  });

  assert.deepStrictEqual(actual, EXPECT);
});
