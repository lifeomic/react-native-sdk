import { EventEmitter } from 'events';
import { PendingInvite } from './InviteProvider';

export type InviteParams = PendingInvite;

type InviteState = {
  loading?: boolean;
  failedToDecode?: boolean;
  failureMessage?: string;
};

export type EventTypeHandlers = {
  inviteDetected: (inviteParams: InviteParams) => void;
  inviteLoadingStateChanged: (state: InviteState) => void;
};

export type EventTypes = keyof EventTypeHandlers;
export type EventTypeHandler<T extends EventTypes> = EventTypeHandlers[T];
export class InviteNotifier {
  private emitter = new EventEmitter();
  private lastInviteDetectedParams: InviteParams | undefined;
  private lastInviteState: InviteState | undefined;

  public addListener<T extends EventTypes>(
    eventType: T,
    listener: EventTypeHandler<T>,
  ) {
    if (eventType === 'inviteDetected' && this.lastInviteDetectedParams) {
      (listener as EventTypeHandler<'inviteDetected'>)(
        this.lastInviteDetectedParams,
      );
    } else if (
      eventType === 'inviteLoadingStateChanged' &&
      this.lastInviteState
    ) {
      (listener as EventTypeHandler<'inviteLoadingStateChanged'>)(
        this.lastInviteState,
      );
    }
    return this.emitter.addListener(eventType, listener);
  }

  public removeListener<T extends EventTypes>(
    eventType: EventTypes,
    listener: EventTypeHandler<T>,
  ) {
    return this.emitter.removeListener(eventType, listener);
  }

  public emit<T extends EventTypes>(
    eventType: T,
    ...params: Parameters<EventTypeHandler<T>>
  ) {
    this.lastInviteDetectedParams = params[0] as InviteParams;
    return this.emitter.emit(eventType, ...params);
  }

  public clearCache() {
    this.lastInviteDetectedParams = undefined;
  }
}

export const inviteNotifier = new InviteNotifier();
