import React, { useMemo } from 'react';
import { ColorValue, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useIcons } from '../../BrandConfigProvider';
import { camelCase, upperFirst } from 'lodash';

type IndicatorProps = {
  /**
   * @property The name of the icon to use. Can be an id for dynamic icons or a static value.
   */
  name: string;
  color?: ColorValue;
  scale?: number;
  /**
   * @property A icon name to fallback to if `name` is not found
   */
  fallbackName?: string;
};

export const INDICATOR_HEIGHT = 20;

export const aliases: Record<string, string> = {
  cocktail: 'alcohol',
  'fast-food': 'burger',
  flossing: 'floss',
  walking: 'steps',
  water: 'droplet',
};

const Indicator = ({
  name,
  scale = 1,
  fallbackName = '',
  ...rest
}: IndicatorProps) => {
  const Icons = useIcons();
  const CustomIcon = Icons[name] ?? Icons[fallbackName];

  const svgProps: SvgProps = {
    width: '100%',
    height: '100%',
    ...rest,
  };

  const iconName = useMemo(
    () => upperFirst(camelCase(aliases[name] ?? name)),
    [name],
  );
  const fallbackIconName = useMemo(
    () => upperFirst(camelCase(aliases[fallbackName] ?? fallbackName)),
    [fallbackName],
  );

  const Icon = Icons[iconName] ?? Icons[fallbackIconName];

  return (
    <View
      style={{
        width: INDICATOR_HEIGHT * scale,
        height: INDICATOR_HEIGHT * scale,
      }}
    >
      {(CustomIcon && <CustomIcon {...svgProps} />) ??
        (Icon && <Icon {...svgProps} />) ?? <Icons.Helix {...svgProps} />}
    </View>
  );
};

export default Indicator;
