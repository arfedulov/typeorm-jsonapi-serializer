import assert from 'assert';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import * as JSONAPI from 'jsonapi-typescript';

import { Deserializer } from '../Deserializer';
import { Serializable } from '../../decorators/Serializable';

@Entity()
@Serializable('users')
class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @ManyToOne((type) => City, (city) => city.people)
  city!: Promise<City>;
}

@Entity()
@Serializable('cities')
class City {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany((type) => User, (u) => u.city)
  people!: Promise<User[]>;
}

test('deserialize entity with one id field', () => {
  const INPUT: JSONAPI.ResourceObject = {
    type: 'users',
    id: '0',
  };

  const EXPECT = new User();
  EXPECT.id = 0;

  const actual = Deserializer()(INPUT);

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserialize entity with attributes only', () => {
  const INPUT: JSONAPI.ResourceObject = {
    type: 'users',
    attributes: {
      firstName: 'Ivan',
      lastName: 'Petrov',
    },
  };

  const EXPECT = new User();
  EXPECT.firstName = 'Ivan';
  EXPECT.lastName = 'Petrov';

  const actual = Deserializer()(INPUT);

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserialize entity with to-one relationships', () => {
  const INPUT: JSONAPI.ResourceObject = {
    type: 'users',
    relationships: {
      city: {
        data: {
          id: '22',
          type: 'cities',
        },
      },
    },
  };

  const EXPECT = new User();
  const CITY = new City();
  CITY.id = 22;
  EXPECT.city = Promise.resolve(CITY);

  const actual = Deserializer()(INPUT);

  assert.deepStrictEqual(actual, EXPECT);
});

test('deserialize entity with to-many relationships', () => {
  const INPUT: JSONAPI.ResourceObject = {
    type: 'cities',
    relationships: {
      people: {
        data: [
          { id: '0', type: 'users' },
        ],
      },
    },
  };

  const EXPECT = new City();
  const USER = new User();
  USER.id = 0;
  EXPECT.people = Promise.resolve([USER]);

  const actual = Deserializer()(INPUT);

  assert.deepStrictEqual(actual, EXPECT);
});
