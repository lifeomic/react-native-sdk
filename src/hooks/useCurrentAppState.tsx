import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useCurrentAppState() {
  const [currentAppState, setCurrentAppState] = useState(AppState.currentState);

  useEffect(() => {
    const listener = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        setCurrentAppState(nextAppState);
      },
    );

    return () => {
      listener.remove();
    };
  }, []);

  return {
    currentAppState,
  };
}
