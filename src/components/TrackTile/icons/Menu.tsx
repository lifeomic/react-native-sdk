import React from 'react';
import { Svg, Path } from 'react-native-svg';

const Menu = ({ stroke = '#B2B9C0' }) => (
  <Svg viewBox="0 0 33 14" fill="none">
    <Path
      d="M1.125 7H31.875M1.125 1H31.875M1.125 13H31.875"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Menu;
