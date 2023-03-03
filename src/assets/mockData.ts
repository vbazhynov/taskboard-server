import { Card } from '../data/models/card';
import { List } from '../data/models/list';

const toDo = new List('To do');
toDo.cards = [
  new Card(
    'Implement renaming lists',
    'Should be possible to change the name of the list',
  ),
  new Card('Implement adding cards', 'Should be possible to create cards'),
  new Card(
    'Implement removing of cards',
    'Should be possible to remove card when button clicked',
  ),
  new Card(
    'Implement changing name of card',
    'Should be possible to change the name of card',
  ),
  new Card(
    'Implement changing description of card',
    'Should be possible to change description of card',
  ),
  new Card(
    'Implement copy card',
    'Using pattern Prototype implement a possibility to copy card. Id should be new for new card. The name of card should have "copy" suffix',
  ),
  new Card(
    'Implement logging on server side',
    'Using pattern Observer implement logging with 3 levels: info, warn, error. There should be 2 loggers: first will write only errors into console, second will write all logs into file',
  ),
  new Card(
    'Implement logging of reorder action',
    'Using pattern Proxy implement logging for the ReorderService (logging proxy). Should be logged each what card/list and when was moved',
  ),
];

const inProgress = new List('In progress');
inProgress.cards = [
  new Card('Implement adding lists', 'Should be possible to create list'),
];

export const lists = [toDo, inProgress];
