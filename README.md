# typeorm-jsonapi-serializer

Provides (de)serialization of jsonapi data for typeorm.

:warning: Deserialization of many-to-many relationships implemented via
typeorm liking entity is not supported yet. You will get an error
if you try to deserialize such relationships. Skip such relationsips
using `@Skip` decorator or use typeorm's `@ManyToMany` decorator ( many-to-many
relationships implemented with this decorator should be deserialized fine ).


## Usage

### serialization

```ts
import { Serializable, Skip, Serializer } from '@arfedulov/typeorm-jsonapi-serializer';

@Entity()
@Serializable('zoos')
class Zoo {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany((type) => Animal, (animal) => animal.zoo)
  animals?: Promise<Animal[]>;
}

@Entity()
@Serializable('animals')
class Animal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  @Skip
  secretName!: string;

  @ManyToOne((type) => Zoo, (zoo) => zoo.animals)
  zoo!: Promise<Zoo>;
}

const zoo = new Zoo();
zoo.id = 0;

const animal = new Animal();
animal.id = 1;
animal.zoo = zoo;
animal.name = 'bear';
animal.secretName = '^(-.-)^';

const data = Serializer()(animal);
console.log(data);
/*
{
  "id": "1",
  "type": "animals",
  "attributes": {
    "name": "bear"
  },
  "relationships": {
    "zoo": {
      "data": {
        "id": "0",
        "type": "zoos"
      }
    }
  }
}

*/
```

### deserialization

```ts
import { Deserializer } from '@arfedulov/typeorm-jsonapi-serializer';
import { Animal } from './entity/Animal';
import assert from 'assert';

const data = {
  id: '1',
  type: 'animals',
  attributes: {
    name: 'bear'
  },
  relationships: {
    zoo: {
      data: {
        id: '0',
        type: 'zoos'
      }
    }
  }
};

const EXPECT = new Animal();
EXPECT.id = 1;
EXPECT.name = 'bear';
EXPECT.zoo = Promise.resolve(new Zoo(0/*id*/))
const animal = Deserializer()(data);

assert.deepStrictEqual(animal, EXPECT);
/* OK */

```
