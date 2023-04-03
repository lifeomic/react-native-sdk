import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../defaultTheme';

const Info = ({ stroke = Colors.info }) => {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M10.4 19.748a9 9 0 100-18 9 9 0 000 18zM10.4 14.348v-3.6M10.4 7.148v-.45"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Info;
