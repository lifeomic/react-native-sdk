import { EventEmitter } from 'events';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
} from './TrackTileService';

export type EventTypeHandlers = {
  trackerChanged: (...tracker: Tracker[]) => void;
  trackerRemoved: (tracker: Tracker) => void;
  valuesChanged: (
    updates: {
      valuesContext: TrackerValuesContext;
      metricId: string;
      tracker: Partial<TrackerValue>;
      drop?: boolean;
      saveToRecent?: boolean;
    }[],
  ) => void;
  saveEditTrackerValue: (
    resolve?: (newValue: TrackerValue | undefined) => void,
    reject?: (reason?: unknown) => void,
  ) => void;
};

export type EventTypes = keyof EventTypeHandlers;
export type EventTypeHandler<T extends EventTypes> = EventTypeHandlers[T];

export class TrackTileEmitter extends EventEmitter {
  public addListener<T extends EventTypes>(
    eventType: T,
    listener: EventTypeHandler<T>,
  ) {
    return super.addListener(eventType, listener);
  }

  public removeListener<T extends EventTypes>(
    eventType: EventTypes,
    listener: EventTypeHandler<T>,
  ) {
    return super.removeListener(eventType, listener);
  }

  public emit<T extends EventTypes>(
    eventType: T,
    ...params: Parameters<EventTypeHandler<T>>
  ) {
    return super.emit(eventType, ...params);
  }
}

export const notifier = new TrackTileEmitter();

export const notifyTrackerRemoved = (tracker: Tracker) =>
  notifier.emit('trackerRemoved', tracker);

export const notifySaveEditTrackerValue = (
  ...args: Parameters<EventTypeHandler<'saveEditTrackerValue'>>
) => notifier.emit('saveEditTrackerValue', ...args);
