import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Theme } from '../theme/Theme';

/**
 * This module is referenced globally as @styles
 */

export interface ComponentStyles {}

// Convenience type to get a deep partial type version of the styles prop
declare global {
  type NamedStylesProp<T extends StylesBuilder> = RecursivePartial<
    NamedStyles<T>
  >;
}

export type BrandConfigProviderStyles = RecursivePartial<ComponentStyles>;

export interface StylesObject {
  [x: string]: ViewStyle | TextStyle | ImageStyle;
}

// This type allows us to call useStyles with either an object
// or function if a Theme is needed
export type StylesBuilder = StylesObject | ((theme: Theme) => StylesObject);

// This extracts the named styles (container, wrapper, etc.) from the style builder
export type NamedStyles<T extends StylesBuilder> = T extends (
  theme: Theme,
) => infer U
  ? Record<keyof U, ViewStyle | TextStyle | ImageStyle>
  : Record<keyof T, ViewStyle | TextStyle | ImageStyle>;

// Creates a Named StylesProp context to group component level styles together (TrackTile, LoginButton, etc.)
export type ComponentNamedStyles<
  Name extends String,
  T extends StylesBuilder,
> = Record<StringLiteral<Name>, NamedStyles<T>>;

// See: https://stackoverflow.com/questions/56373756/typescript-constrain-generic-to-string-literal-type-for-use-in-computed-object-p
type StringLiteral<T> = T extends `${string & T}` ? T : never;

// Creates a recursive partial of an object where all keys of all nested objects are optional
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};
