import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Theme } from '../theme/types';

/**
 *
 * @param namespace A string literal name that becomes the first level property names of
 * the style object returned from `useStyles` - usually the exact name of the component being styled.
 * @param styleBuilder This is a function that takes a theme and returns an object with named styles.
 * Each named styles will be typed according to the case-insensitive suffix of their name:
 *   - Names ending in `Image` will become an `ImageStyle` type
 *   - Names ending in `Text` or `Label` will become a `TextStyle` type
 *   - Names ending in `View`, `Container`, `Button` or `Wrapper` will become a `ViewStyle` type
 *   - Names ending in anything else will be returned as the type of object provided.
 * Other suffixes and/or types can be added when needed.
 * @returns The defaultStyles function that returns the named, typed style builder to be given to `useStyles`
 */
export const createStyles: CreateStyles = (namespace, styleBuilder) => {
  const defaultStyles = (theme: Theme) => {
    return [namespace, styleBuilder(theme)] as const;
  };

  return defaultStyles;
};

export type CreateStyles<Names = string> = <
  N extends Names,
  T extends NamedStyles<T>,
>(
  namespace: StringLiteral<N>,
  styleBuilder: StylesBuilder<T>,
) => (theme: Theme) => Readonly<[StringLiteral<N>, NamedStyles<T>]>;

/**
 * Parses out the named properties and assigns types based on their suffix
 */
export type NamedStyles<T> = {
  [P in keyof T]: P extends `${string}${IgnoreCapitals<TextSuffixes>}`
    ? TextStyle
    : P extends `${string}${IgnoreCapitals<ImageSuffixes>}`
    ? ImageStyle
    : P extends `${string}${IgnoreCapitals<ViewSuffix>}`
    ? ViewStyle
    : Partial<T[P]>;
};

/**
 * IgnoreCapitals is used when parsing suffixes so that, for example, a style name of text or fooText
 * would both get the TextStyle type.
 */
type IgnoreCapitals<T> = T extends string
  ? Uncapitalize<T> | Capitalize<T>
  : never;

type TextSuffixes = 'Text' | 'Label';

type ImageSuffixes = 'Image';

type ViewSuffix = 'Container' | 'View' | 'Button' | 'Wrapper';

type StylesBuilder<T> = (theme: Theme) => NamedStyles<T>;

/**
 * Allows a string literal but not a variable of type string
 *
 * See: https://stackoverflow.com/questions/56373756/typescript-constrain-generic-to-string-literal-type-for-use-in-computed-object-p
 */
type StringLiteral<T> = T extends `${string & T}` ? T : never;
