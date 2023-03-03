import { randomUUID } from 'crypto';

class Card {
  public id: string;

  public name: string;

  public description: string;

  public createAt: Date;

  public constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.createAt = new Date();
    this.id = randomUUID();
  }

  // PATTERN:{Prototype}

  public clone?() {
    return new Card(`"copy" ${this.name}`, this.description);
  }
}

export { Card };
