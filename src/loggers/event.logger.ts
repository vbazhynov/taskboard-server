import * as fs from 'fs';
import { LogLevels } from '../common/enums/log.level.enum';

export class EventLogger {
  public subscribers = [];

  public subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  // PATTERN:{Observer}
  private notify = (message: string) => {
    this.subscribers.forEach(subscriber => subscriber.logError(message));
  };

  public update = (message: string) => {
    fs.appendFile('logs.txt', message, err => {
      if (err) {
        // PATTERN:{Observer}
        this.notify(
          `${
            LogLevels.error
          } : ${new Date().toISOString()} : Unable to write to file \n`,
        );
      }
    });
  };
}
