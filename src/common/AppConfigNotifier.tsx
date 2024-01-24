import { AppConfig } from '../hooks';
import { SDKEventEmitter } from './SDKEventEmitter';

export const appConfigChangeEventType = 'appConfigChanged';
export type AppConfigChangeHandler = (config: AppConfig | undefined) => void;
export class AppConfigNotifier {
  private emitter = new SDKEventEmitter();

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
