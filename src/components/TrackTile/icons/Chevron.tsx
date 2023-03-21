import React from 'react';
import { Svg, Path } from 'react-native-svg';

type Props = {
  direction?: 'left' | 'right' | 'up' | 'down';
  fill?: string;
  strokeWidth?: number;
};

const Chevron: React.FC<Props> = (props) => {
  const { direction = 'left', fill = '#262C32', strokeWidth } = props;
  const rotate = {
    left: '0deg',
    right: '180deg',
    up: '90deg',
    down: '-90deg'
  }[direction];

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 13 21"
      style={{ transform: [{ rotate }], aspectRatio: 1 }}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0371 20.5827L0.792152 11.4458C0.402616 11.0612 0.402616 10.4398 0.792152 10.0542L10.0371 0.917333C10.5995 0.360889 11.5144 0.360889 12.0777 0.917333C12.64 1.47378 12.64 2.37687 12.0777 2.93332L4.16913 10.7505L12.0777 18.5657C12.64 19.1231 12.64 20.0262 12.0777 20.5827C11.5144 21.1391 10.5995 21.1391 10.0371 20.5827Z"
        fill={fill}
        stroke={strokeWidth && fill}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default Chevron;
