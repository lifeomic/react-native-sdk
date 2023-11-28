import { Alert } from 'react-native';
import { t } from '../../../../lib/i18n';
import { TrackerDetailsError } from '../services/TrackTileService';

export function DefaultOnError(error: any) {
  console.warn('Error in tracker details', error);
  let message = t(
    'generic-tracker-error-message',
    'Error saving tracker details. Please try again.',
  );
  if (error instanceof TrackerDetailsError && error.userErrorMessage) {
    message = error.userErrorMessage;
  }
  Alert.alert(message);
}
