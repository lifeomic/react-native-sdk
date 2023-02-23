import { Theme } from './Theme';
import { TextStyles } from '../Text/types';
import { defaultTextStyles } from '../Text/default';

interface Props {
  theme: Theme;
}

export class Styles {
  Text: TextStyles;

  constructor({ theme }: Props) {
    this.Text = defaultTextStyles(theme);
  }
}
