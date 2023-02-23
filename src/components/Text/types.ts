import { TextStyle } from 'react-native';

export interface TextStyles {
  base?: TextStyle;
  body?: TextStyle;
  heading?: TextStyle;
  subHeading?: TextStyle;
}

export type Variant = 'body' | 'heading' | 'subHeading';
