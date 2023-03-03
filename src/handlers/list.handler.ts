import type { Socket } from 'socket.io';

import { LogLevels } from '../common/enums/log.level.enum';
import { ListEvent } from '../common/enums';
import { List } from '../data/models/list';
import { EventLogger } from '../loggers/event.logger';
import { SocketHandler } from './socket.handler';

export const eventLogger = new EventLogger();

export class ListHandler extends SocketHandler {
  private subscribers = [];

  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
    socket.on(ListEvent.RENAME, this.renameList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));

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

  private getLists(callback: (cards: List[]) => void): void {
    callback(this.db.getData());
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    const lists = this.db.getData();
    const reorderedLists = this.reorderService.reorder(
      lists,
      sourceIndex,
      destinationIndex,
    );
    this.db.setData(reorderedLists);
    this.updateLists();
  }

  private createList(name: string): void {
    const lists = this.db.getData();
    const newList = new List(name);
    this.db.setData(lists.concat(newList));
    this.updateLists();

    // PATTERN:{Observer}
    this.notify(
      `${
        LogLevels.info
      } : ${new Date().toISOString()} : List "${name}" Was Created \n`,
    );
  }

  private deleteList(listId: string): void {
    const lists = this.db.getData();
    const index = lists.findIndex(list => list.id === listId);
    const newLists = [...lists];
    newLists.splice(index, 1);
    this.db.setData(newLists);
    this.updateLists();

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.warn} : ${new Date().toISOString()} : List "${
        lists[index].name
      }" Was Deleted \n`,
    );
  }

  private renameList(listId: string, newTitle: string): void {
    const lists = this.db.getData();
    const list = lists.find(list => list.id === listId);

    // PATTERN:{Observer}
    this.notify(
      `${LogLevels.info} : ${new Date().toISOString()} : List "${
        list.name
      }" Was Renamed to ${newTitle} \n`,
    );

    list.name = newTitle;
    const index = lists.findIndex(list => list.id === listId);
    const newLists = [...lists];
    newLists.splice(index, 1, list);
    this.db.setData(newLists);
    this.updateLists();
  }
}
