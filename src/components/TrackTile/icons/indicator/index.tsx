import React from 'react';
import { ColorValue, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import {
  Alcohol,
  Apple,
  BookOpen,
  Broccoli,
  Burger,
  Check,
  Chroma,
  ClockForward,
  Droplet,
  Floss,
  Heart,
  Helix,
  Moon,
  Music,
  Plant,
  PlayCircle,
  PlusCircle,
  Running,
  Sitting,
  Smile,
  Soda,
  Star,
  Steps,
  Target,
} from '@lifeomic/chromicons-native';

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
          apple: <Apple {...svgProps} />,
          broccoli: <Broccoli {...svgProps} />,
          'book-open': <BookOpen {...svgProps} />,
          check: <Check {...svgProps} />,
          chroma: <Chroma {...svgProps} />,
          'clock-forward': <ClockForward {...svgProps} />,
          cocktail: <Alcohol {...svgProps} />,
          droplet: <Droplet {...svgProps} />,
          'fast-food': <Burger {...svgProps} />,
          flossing: <Floss {...svgProps} />,
          heart: <Heart {...svgProps} />,
          moon: <Moon {...svgProps} />,
          music: <Music {...svgProps} />,
          plant: <Plant {...svgProps} />,
          'play-circle': <PlayCircle {...svgProps} />,
          'plus-circle': <PlusCircle {...svgProps} />,
          running: <Running {...svgProps} />,
          sitting: <Sitting {...svgProps} />,
          smile: <Smile {...svgProps} />,
          soda: <Soda {...svgProps} />,
          star: <Star {...svgProps} />,
          target: <Target {...svgProps} />,
          walking: <Steps {...svgProps} />,
          water: <Droplet {...svgProps} />,
        }[name] ?? <Helix {...svgProps} />)}
    </View>
  );
};

export default Indicator;
