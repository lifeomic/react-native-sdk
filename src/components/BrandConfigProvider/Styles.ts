import { TextStyles } from '../Text/TextStyles';
import { Theme } from './Theme';

interface Props {
  theme?: Theme;
}

export class Styles {
  Text: TextStyles;

  private _theme: Theme;

  constructor({ theme }: Props = {}) {
    this._theme = theme || new Theme();

    this.Text = new TextStyles(this._theme);
  }
}
