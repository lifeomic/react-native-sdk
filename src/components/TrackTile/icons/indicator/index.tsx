import React from 'react';
import { ColorValue, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useIcons } from '../../../BrandConfigProvider';

type IndicatorProps = {
  name: string;
  color?: ColorValue;
  scale?: number;
  CustomIcon?: React.ComponentType<SvgProps>;
};

export const INDICATOR_HEIGHT = 20;

const Indicator = ({
  name,
  scale = 1,
  CustomIcon,
  ...rest
}: IndicatorProps) => {
  const Icons = useIcons();

  const svgProps: SvgProps = {
    width: '100%',
    height: '100%',
    ...rest,
  };

  return (
    <View
      style={{
        width: INDICATOR_HEIGHT * scale,
        height: INDICATOR_HEIGHT * scale,
      }}
    >
      {(!!CustomIcon && <CustomIcon {...svgProps} />) ||
        ({
          apple: <Icons.Apple {...svgProps} />,
          broccoli: <Icons.Broccoli {...svgProps} />,
          'book-open': <Icons.BookOpen {...svgProps} />,
          check: <Icons.Check {...svgProps} />,
          chroma: <Icons.Chroma {...svgProps} />,
          'clock-forward': <Icons.ClockForward {...svgProps} />,
          cocktail: <Icons.Alcohol {...svgProps} />,
          droplet: <Icons.Droplet {...svgProps} />,
          'fast-food': <Icons.Burger {...svgProps} />,
          flossing: <Icons.Floss {...svgProps} />,
          heart: <Icons.Heart {...svgProps} />,
          moon: <Icons.Moon {...svgProps} />,
          music: <Icons.Music {...svgProps} />,
          plant: <Icons.Plant {...svgProps} />,
          'play-circle': <Icons.PlayCircle {...svgProps} />,
          'plus-circle': <Icons.PlusCircle {...svgProps} />,
          running: <Icons.Running {...svgProps} />,
          sitting: <Icons.Sitting {...svgProps} />,
          smile: <Icons.Smile {...svgProps} />,
          soda: <Icons.Soda {...svgProps} />,
          star: <Icons.Star {...svgProps} />,
          target: <Icons.Target {...svgProps} />,
          walking: <Icons.Steps {...svgProps} />,
          water: <Icons.Droplet {...svgProps} />,
        }[name] ?? <Icons.Helix {...svgProps} />)}
    </View>
  );
};

export default Indicator;
