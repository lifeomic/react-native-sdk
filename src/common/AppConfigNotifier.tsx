import { EventEmitter } from 'events';
import { AppConfig } from '../types';

export const appConfigChangeEventType = 'appConfigChanged';
export type AppConfigChangeHandler = (config: AppConfig | undefined) => void;
export class AppConfigNotifier {
  private emitter = new EventEmitter();

  public addListener(listener: AppConfigChangeHandler) {
    return this.emitter.addListener(appConfigChangeEventType, listener);
  }

  public removeListener(listener: AppConfigChangeHandler) {
    return this.emitter.removeListener(appConfigChangeEventType, listener);
  }

  public emit(config: AppConfig | undefined) {
    return this.emitter.emit(appConfigChangeEventType, config);
  }
}

export const appConfigNotifier = new AppConfigNotifier();
