import React from 'react';
import { Svg, Rect, Defs, Stop, LinearGradient } from 'react-native-svg';

const TileBackground = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 347 358"
    fill="none"
    preserveAspectRatio="none"
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }}
  >
    <Rect width="347" height="358" fill="url(#pillarsTileBackgroundGradient)" />

    <Defs>
      <LinearGradient
        id="pillarsTileBackgroundGradient"
        x1="442.309"
        y1="-30"
        x2="419.614"
        y2="300"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0.0001" stopColor="#1C4B80" />
        <Stop offset="1" stopColor="#222222" />
      </LinearGradient>
    </Defs>
  </Svg>
);

export default TileBackground;
