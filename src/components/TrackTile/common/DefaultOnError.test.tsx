import { Alert } from 'react-native';
import { DefaultOnError } from './DefaultOnError';
import { TrackerDetailsError } from '../services/TrackTileService';

const alertSpy = jest.spyOn(Alert, 'alert');

describe('DefaultOnError', () => {
  it('should display user error message if provided', () => {
    const error = new TrackerDetailsError();
    error.userErrorMessage = 'unit test';
    DefaultOnError(error);
    expect(alertSpy).toHaveBeenCalledWith(error.userErrorMessage);
  });

  it('should display generic error message if userMessage not provided', () => {
    const error = new Error();
    DefaultOnError(error);
    expect(alertSpy).toHaveBeenCalledWith(
      'Error saving tracker details. Please try again.',
    );
  });
});
