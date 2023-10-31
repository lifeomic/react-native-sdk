import { StackScreenProps } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';

type RouteMapOf<K extends string, ParamList extends ParamListBase> = Record<
  K,
  keyof ParamList
>;

export function toRouteMap<RouteMap extends object>(routeMap: RouteMap) {
  return routeMap as { [K in keyof RouteMap]: K };
}

export type ScreenParamTypes<
  ScreenParams extends object | undefined,
  ParamList extends ParamListBase = {},
  RouteMapProps extends ParamListBase = {},
  ScreenParamList extends ParamListBase = RouteMapProps &
    Record<string, ScreenParams>,
  RouteMap = RouteMapOf<
    Exclude<keyof RouteMapProps, number | symbol>,
    ParamList
  >,
  ScreenProps = StackScreenProps<ScreenParamList, string>,
> = {
  /**
   * @description Map of route name placeholders to consuming stack route names
   */
  RouteMap: RouteMap;
  /**
   * @description Navigation props and routeMapIn prop for the stack agnostic screen
   */
  ComponentProps: ScreenProps & {
    /**
     * @description A map of sub-route name placeholders to the consuming stack's actual route names
     */
    routeMapIn: RouteMap;
  };
  /**
   * @description Screen Props that can be used with any name stack route
   */
  ScreenProps: ScreenProps;
};

export type ScreenProps<
  ScreenParams extends object | undefined,
  ParamList extends ParamListBase = {},
  RouteMapProps extends ParamListBase = {},
> = ScreenParamTypes<ScreenParams, ParamList, RouteMapProps>['ScreenProps'];
