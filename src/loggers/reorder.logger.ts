import { ReorderService } from '../services/reorder.service';
import { List } from '../data/models/list';
import * as fs from 'fs';

export class ProxyLogger {
  public reorderService: ReorderService;

  public constructor(reorderService: ReorderService) {
    this.reorderService = reorderService;
  }
  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    // PATTERN:{Proxy}
    const item = items[startIndex] as List;
    const message = `${new Date().toISOString()} : Column "${
      item.name
    }" was moved from position ${startIndex + 1} to position ${
      endIndex + 1
    } \n`;
    fs.appendFile('reorderLogs.txt', message, err => {
      if (err) {
        console.log(`${new Date().toISOString()} : Unable to write to file \n`);
      }
    });

    return this.reorderService.reorder(items, startIndex, endIndex);
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    // PATTERN:{Proxy}
    const sourceList = lists.find(list => list.id === sourceListId);
    const destinationList = lists.find(list => list.id === destinationListId);
    const card = sourceList.cards[sourceIndex];
    const message = `${new Date().toISOString()} : Card "${
      card.name
    }"  was moved from list  "${sourceList.name}" to list "${
      destinationList.name
    }" \n`;
    fs.appendFile('reorderLogs.txt', message, err => {
      if (err) {
        console.log(`${new Date().toISOString()} : Unable to write to file \n`);
      }
    });

    return this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
  }
}
