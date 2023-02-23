import { Theme } from '../BrandConfigProvider/Theme';
import { TextStyles } from './types';

export const defaultTextStyles = (theme: Theme) => {
  const styles: TextStyles = {
    // base is applied to all variants
    base: {
      color: theme.colors.text,
    },
    // variant
    body: {},
    // variant
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    // variant
    subHeading: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  };

  return styles;
};
