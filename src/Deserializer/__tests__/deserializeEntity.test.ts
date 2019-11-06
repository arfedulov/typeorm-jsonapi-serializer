import assert from 'assert';
import * as JSONAPI from 'jsonapi-typescript';

import { deserializeEntity } from '../deserializeEntity';

test('deserializeEntity(): deserialize jsonapi resource object with id and type fields only', () => {
  class EntityMock {
    id: number;
    constructor(id: number) {
      this.id = id;
    }
  }
  const INPUT: JSONAPI.ResourceObject = {
    id: '12345',
    type: 'stuff',
  };
  const EXPECT = new EntityMock(12345);

  const actual = deserializeEntity(EntityMock, INPUT, {
    relationEntityConstructors: {},
    linkingEntityIdFields: {},
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserializeEntity(): deserialize jsonapi resource object with "attributes" field', () => {
  class EntityMock {
    id: number;
    firstName: string;
    lastName: string;
    constructor(id: number, firstName: string, lastName: string) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
    }
  }
  const INPUT: JSONAPI.ResourceObject = {
    id: '12345',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
  };
  const EXPECT = new EntityMock(12345, 'Ivan', 'Petrov');

  const actual = deserializeEntity(EntityMock, INPUT, {
    relationEntityConstructors: {},
    linkingEntityIdFields: {},
  });

  assert.deepStrictEqual(actual, EXPECT);
});

const createMockClass = (...argnames: any[]) => {
  return class {
    constructor(...args: any[]) {
      if (args) {
        args.forEach((arg, i) => {
          (this as any)[argnames[i]] = arg;
        });
      }
    }
  };
};

test('deserializeEntity(): deserialize jsonapi resource object with to-one "relationships" field', () => {
  class City {
    id: number;
    constructor(id: number) {
      this.id = id;
    }
  }
  class EntityMock {
    id: number;
    firstName: string;
    lastName: string;
    city: Promise<City>;
    constructor(id: number, firstName: string, lastName: string, city: City) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
      this.city = Promise.resolve(city);
    }
  }
  const INPUT: JSONAPI.ResourceObject = {
    id: '12345',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      city: {
        data: {
          id: '0',
          type: 'cities',
        },
      },
    },
  };
  const EXPECT = new EntityMock(12345, 'Ivan', 'Petrov', new City(0));

  const actual = deserializeEntity(EntityMock, INPUT, {
    relationEntityConstructors: {
      city: City,
    },
    linkingEntityIdFields: {},
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserializeEntity(): deserialize jsonapi resource object with to-many "relationships" field', () => {
  class Article {
    id: number;
    constructor(id: number) {
      this.id = id;
    }
  }
  class EntityMock {
    id: number;
    firstName: string;
    lastName: string;
    articles: Promise<Article[]>;
    constructor(id: number, firstName: string, lastName: string, articles: Article[]) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
      this.articles = Promise.resolve(articles);
    }
  }
  const INPUT: JSONAPI.ResourceObject = {
    id: '12345',
    type: 'stuff',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
    relationships: {
      articles: {
        data: [
          {
            id: '0',
            type: 'articles',
          },
          {
            id: '1',
            type: 'articles',
          },
        ],
      },
    },
  };
  const EXPECT = new EntityMock(12345, 'Ivan', 'Petrov', [new Article(0), new Article(1)]);

  const actual = deserializeEntity(EntityMock, INPUT, {
    relationEntityConstructors: {
      articles: Article,
    },
    linkingEntityIdFields: {},
  });

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserializeEntity(): deserialize jsonapi resource object with to-many "relationships" field (through linking table)', () => {
  class UserToGroup {
    userId: number;
    groupId: number;
    constructor(uid: number, gid: number) {
      this.userId = uid;
      this.groupId = gid;
    }
  }
  class User {
    id: number;
    groups: Promise<UserToGroup[]>;
    constructor(id: number, groups: UserToGroup[]) {
      this.id = id;
      this.groups = Promise.resolve(groups);
    }
  }
  const INPUT: JSONAPI.ResourceObject = {
    id: '12345',
    type: 'stuff',
    relationships: {
      groups: {
        data: [
          {
            id: '10',
            type: 'groups',
          },
          {
            id: '11',
            type: 'groups',
          },
        ],
      },
    },
  };
  const EXPECT = new User(12345, [new UserToGroup(12345, 10), new UserToGroup(12345, 11)]);

  const actual = deserializeEntity(User, INPUT, {
    relationEntityConstructors: {
      groups: UserToGroup,
    },
    linkingEntityIdFields: {
      groups: { from: 'userId', to: 'groupId' },
    },
  });

  assert.deepStrictEqual(actual, EXPECT);
});
