import assert, { AssertionError } from 'assert';

import { deserializeRelationship } from '../deserializeRelation';

class Article {
  id!: number;

  author!: User;

  constructor(id?: number) {
    if (id) {
      this.id = id;
    }
  }
}

class User {
  id!: number;

  constructor(id?: number) {
    if (id) {
      this.id = id;
    }
  }
}

test('deserializeRelationship(): deserialize to-one relationship', async () => {
  const EXPECT = new Article(55555);
  EXPECT.author = new User(99999);

  const INPUT = {
    id: '99999',
    type: 'people',
  };

  const actual = await deserializeRelationship({
    data: INPUT,
    resourceObj: new Article(55555),
    relationshipCtor: User,
    relationshipName: 'author',
    eager: true,
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserializeRelationship(): throw on to-many relationship input', async () => {
  const INPUT = [
    {
      id: '0',
      type: 'article',
    },
    {
      id: '1',
      type: 'article',
    },
  ];

  try {
    await deserializeRelationship({
      data: INPUT,
      resourceObj: new User(55555),
      relationshipCtor: Article,
      relationshipName: 'articles',
      eager: true,
    });

    throw new AssertionError({ message: 'Expect to throw an Error but it throws nothing' });
  } catch (err) {
    if (err.message !== '`to-many` relationship is not supported') {
      throw err;
    }
  }
});
