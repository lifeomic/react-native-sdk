import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../defaultTheme';

const Chevron = ({ fill = Colors.chevron }) => {
  return (
    <Svg width={9} height={14} viewBox="0 0 9 14" fill="none">
      <Path
        d="M.723 12.382l1.554 1.554 6.588-6.588L2.277.759.723 2.313l5.034 5.035-5.034 5.034z"
        fill={fill}
      />
    </Svg>
  );
};

export default Chevron;
