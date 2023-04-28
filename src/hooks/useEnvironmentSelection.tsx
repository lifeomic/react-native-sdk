import { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

const eventEmitter = new NativeEventEmitter({
  addListener: () => {},
  removeListeners: () => {},
});

const environmentToggledEvent = 'environmentToggledEvent';

export const emitEnvironmentToggled = (value: string) =>
  eventEmitter.emit(environmentToggledEvent, value);

export const useEnvironmentSelection = () => {
  const [usePrimaryEnvironment, setUsePrimaryEnvironment] = useState(true);

  useEffect(() => {
    const subscription = eventEmitter.addListener(
      environmentToggledEvent,
      (environment) => {
        setUsePrimaryEnvironment(environment !== 'secondary');
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return usePrimaryEnvironment;
};
