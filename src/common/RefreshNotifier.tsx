import { EventEmitter } from 'events';

export type RefreshParams = {
  context?: 'HomeScreen';
};

export const refreshEventType = 'refreshRequested';
export type RefreshHandler = (refreshParams: RefreshParams) => void;
export class RefreshNotifier {
  private emitter = new EventEmitter();

  public addListener(listener: RefreshHandler) {
    return this.emitter.addListener(refreshEventType, listener);
  }

  public removeListener(listener: RefreshHandler) {
    return this.emitter.removeListener(refreshEventType, listener);
  }

  public emit(params: RefreshParams) {
    return this.emitter.emit(refreshEventType, params);
  }
}

export const refreshNotifier = new RefreshNotifier();
