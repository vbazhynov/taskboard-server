import type { Socket } from 'socket.io';

import { LogLevels } from '../common/enums/log.level.enum';
import { CardEvent } from '../common/enums';
import { Card } from '../data/models/card';
import { EventLogger } from '../loggers/event.logger';
import { SocketHandler } from './socket.handler';

const eventLogger = new EventLogger();

export class CardHandler extends SocketHandler {
  private subscribers = [];

  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.COPY, this.copyCard.bind(this));
    socket.on(CardEvent.RENAME, this.renameCard.bind(this));
    socket.on(
      CardEvent.CHANGE_DESCRIPTION,
      this.changeCardDescription.bind(this),
    );

    // PATTERN:{Observer}
    this.subscribe(eventLogger);
  }

  public subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  // PATTERN:{Observer}
  private notify = (message: string) => {
    this.subscribers.forEach(subscriber => subscriber.update(message));
  };

  public createCard(listId: string, cardName: string): void {
    const newCard = new Card(cardName, '');
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);

    if (!list) return;

    const updatedList = { ...list, cards: list.cards.concat(newCard) };
    this.db.setData(
      lists.map(list => (list.id === listId ? updatedList : list)),
    );
    this.updateLists();

    // PATTERN:{Observer}
    this.notify(
      `${
        LogLevels.info
      } : ${new Date().toISOString()} : Card "${cardName}" Was Created \n`,
    );
  }

  public deleteCard(listId: string, cardId: string): void {
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);
    if (!list) return;

    const index = list.cards.findIndex(card => card.id === cardId);

    const newCards = [...list.cards];
    newCards.splice(index, 1);
    const updatedList = {
      ...list,
      cards: newCards,
    };
    this.db.setData(
      lists.map(list => (list.id === listId ? updatedList : list)),
    );
    this.updateLists();

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.warn} : ${new Date().toISOString()}: Card "${
        list.cards[index].name
      }" Was Deleted  \n`,
    );
  }

  public copyCard(listId: string, cardId: string): void {
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);

    if (!list) return;

    const card = list.cards.find(card => card.id === cardId);
    const index = list.cards.findIndex(card => card.id === cardId);
    const newCard = card.clone(); // PATTERN:{Prototype}
    const newCards = [...list.cards];
    newCards.splice(index + 1, 0, newCard);

    const updatedList = {
      ...list,
      cards: newCards,
    };

    this.db.setData(
      lists.map(list => (list.id === listId ? updatedList : list)),
    );
    this.updateLists();

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.info} : ${new Date().toISOString()}: Card "${
        list.cards[index].name
      }" Was Cloned \n`,
    );
  }

  public renameCard(newTitle: string, listId: string, cardId: string): void {
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);

    if (!list) return;

    const card = list.cards.find(card => card.id === cardId);

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.warn} : ${new Date().toISOString()}: Card "${
        card.name
      }" Was Renamed to "${newTitle}" \n`,
    );
    card.name = newTitle;

    const index = list.cards.findIndex(card => card.id === cardId);
    const newCards = [...list.cards];
    newCards.splice(index, 1, card);

    const updatedList = {
      ...list,
      cards: newCards,
    };

    this.db.setData(
      lists.map(list => (list.id === listId ? updatedList : list)),
    );
    this.updateLists();
  }

  public changeCardDescription(
    cardText: string,
    listId: string,
    cardId: string,
  ): void {
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);

    if (!list) return;

    const card = list.cards.find(card => card.id === cardId);
    card.description = cardText;

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.info} : ${new Date().toISOString()}: Description of Card "${
        card.name
      }" Was Changed \n`,
    );

    const index = list.cards.findIndex(card => card.id === cardId);
    const newCards = [...list.cards];
    newCards.splice(index, 1, card);

    const updatedList = {
      ...list,
      cards: newCards,
    };

    this.db.setData(
      lists.map(list => (list.id === listId ? updatedList : list)),
    );
    this.updateLists();
  }

  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    const lists = this.db.getData();
    const reordered = this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });

    this.db.setData(reordered);
    this.updateLists();
  }
}
