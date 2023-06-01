import React from 'react';
import Svg, { Polygon, SvgProps } from 'react-native-svg';

interface TriangleProps extends SvgProps {
  direction?: 'rtl' | 'ltr';
  color?: string;
  w?: number;
  h?: number;
}

export const TriangleFilled = (props: TriangleProps) => {
  const { h = 20, w = 20, color, direction = 'rtl' } = props;
  const points = {
    rtl: ['0,0', `0,${h}`, `${w}, ${h / 2}`],
    ltr: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  };

  return (
    <Svg width={w} height={h}>
      <Polygon points={points[direction]} fill={color} />
    </Svg>
  );
};
