import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import assert from 'assert';

const serializeEntityMock = jest.fn(
  (resourceType: string, entity: any, options: any) => {}
);

jest.setMock('../serializeEntity', {
  serializeEntity: serializeEntityMock,
});

import { Serializer } from '../Serializer';
import { Serializable } from '../../decorators/Serializable';
import { Skip } from '../../decorators/Skip';

test('Serializer()(): call serializeEntity() with correct arguments', async () => {
  @Entity()
  @Serializable('zoos')
  class Zoo {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany((type) => Animal, (animal) => animal.zoo)
    animals?: Promise<Animal[]>;

    constructor(id: number) {
      this.id = id;
    }
  }

  @Entity()
  @Serializable('animals')
  class Animal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name = 'bear';

    @Column()
    @Skip()
    secretName: string;

    @ManyToOne((type) => Zoo, (zoo) => zoo.animals)
    zoo: Promise<Zoo>;

    constructor(id: number, secretName: string, zoo: Zoo) {
      this.id = id;
      this.secretName = secretName;
      this.zoo = Promise.resolve(zoo);
    }
  }

  const zoo = new Zoo(0);
  const animal = new Animal(1, '^(-.-)^', zoo);

  const EXPECT_ARGS = [
    'animals',
    animal,
    {
      relationshipsTypes: {
        zoo: 'zoos',
      },
      exclude: ['secretName'],
    },
  ];

  await Serializer()(animal);

  const actualArgs = serializeEntityMock.mock.calls[0];

  EXPECT_ARGS.forEach((EXPECT_ARG, i) => {
    assert.deepStrictEqual(actualArgs[i], EXPECT_ARG);
  });
});
