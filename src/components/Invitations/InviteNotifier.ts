import { EventEmitter } from 'events';
import { ProjectInvite } from '../../types';

export type InviteParams = {
  inviteId?: string;
  evc?: string;
};

export type EventTypeHandlers = {
  inviteDetected: (inviteParams: InviteParams) => void;
  inviteAccepted: (invite: ProjectInvite) => void;
};

export type EventTypes = keyof EventTypeHandlers;
export type EventTypeHandler<T extends EventTypes> = EventTypeHandlers[T];
export class InviteNotifier {
  private emitter = new EventEmitter();
  private lastInviteDetectedParams: InviteParams | undefined;

  public addListener<T extends EventTypes>(
    eventType: T,
    listener: EventTypeHandler<T>,
  ) {
    if (eventType === 'inviteDetected' && this.lastInviteDetectedParams) {
      (listener as EventTypeHandler<'inviteDetected'>)(
        this.lastInviteDetectedParams,
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
    if (eventType === 'inviteDetected') {
      this.lastInviteDetectedParams = params[0] as InviteParams;
    }
    return this.emitter.emit(eventType, ...params);
  }

  public clearCache() {
    this.lastInviteDetectedParams = undefined;
  }
}

export const inviteNotifier = new InviteNotifier();
