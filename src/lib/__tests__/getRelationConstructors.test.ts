import assert from 'assert';
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

import { getRelationConstructors } from '../getRelationConstructors';
import { Serializable } from '../../decorators/Serializable';

test(
  'getRelationConstructors({ entityConstructor }): maps relation property names to corresponding entity constructors',
  () => {
    @Entity()
    class User {
      @PrimaryGeneratedColumn()
      id!: number;

      @ManyToOne((type) => City, (city) => city.people)
      city!: Promise<City>;
    }

    @Entity()
    class City {
      @PrimaryGeneratedColumn()
      id!: number;

      @OneToMany((type) => User, (user) => user.city)
      people?: Promise<User[]>;
    }

    const USER_EXPECT = {
      city: City,
    };
    const CITY_EXPECT = {
      people: User,
    };

    const userActual = getRelationConstructors({ entityConstructor: User });
    assert.deepStrictEqual(userActual, USER_EXPECT);

    const cityActual = getRelationConstructors({ entityConstructor: City });
    assert.deepStrictEqual(cityActual, CITY_EXPECT);
  }
);

test(
  'getRelationConstructors({ resourceType }): maps relation property names to corresponding entity constructors',
  () => {
    @Entity()
    @Serializable('users')
    class User {
      @PrimaryGeneratedColumn()
      id!: number;

      @ManyToOne((type) => City, (city) => city.people)
      city!: Promise<City>;
    }

    @Entity()
    @Serializable('cities')
    class City {
      @PrimaryGeneratedColumn()
      id!: number;

      @OneToMany((type) => User, (user) => user.city)
      people?: Promise<User[]>;
    }

    const USER_EXPECT = {
      city: City,
    };
    const CITY_EXPECT = {
      people: User,
    };

    const userActual = getRelationConstructors({ resourceType: 'users' });
    assert.deepStrictEqual(userActual, USER_EXPECT);

    const cityActual = getRelationConstructors({ resourceType: 'cities' });
    assert.deepStrictEqual(cityActual, CITY_EXPECT);
  }
);
