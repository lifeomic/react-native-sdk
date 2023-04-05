import React from 'react';
import { ColorValue } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';

const Info = ({ stroke }: { stroke?: ColorValue }) => {
  const theme = useTheme();
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M10.4 19.748a9 9 0 100-18 9 9 0 000 18zM10.4 14.348v-3.6M10.4 7.148v-.45"
        stroke={stroke ?? theme.colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Info;
