import { CreateStyles } from './createStyles';

/**
 * This module is referenced globally as @styles
 *
 * The ComponentStyles interface is extended with ComponentNamedStyles on every component
 */
export interface ComponentStyles {}

/**
 * This is used for the styles Prop passed into the
 * BrandConfigProvider and StylesProvider
 */
export type BrandConfigProviderStyles = {
  [name in keyof ComponentStyles]?: Partial<ComponentStyles[name]>;
};

/**
 * Creates a Named StylesProp context to group component level styles together (TrackTile, LoginButton, etc.)
 *
 * This is what is used to extend ComponentStyles in this module for every component
 */
export type ComponentNamedStyles<T extends ReturnType<CreateStyles>> = Record<
  ReturnType<T>[0],
  ReturnType<T>[1]
>;

/**
 * Creates a recursive partial of an object where all keys of all nested objects are optional
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

/**
 * Helper used to create the local styles override prop passed into each component
 */
declare global {
  type NamedStylesProp<T extends ReturnType<CreateStyles>> = {
    [name in keyof ReturnType<T>[1]]?: ReturnType<T>[1][name];
  };
}
