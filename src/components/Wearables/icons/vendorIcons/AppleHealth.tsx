import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AppleHealth = () => {
  return (
    <Svg width={31} height={31} viewBox="0 0 31 31" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.685 23.76c-.461 0-3.158-1.456-5.681-3.843-2.002-1.893-3.451-4.677-3.451-7.184 0-2.269 1.904-4.906 4.977-4.906 2.995 0 3.654 1.612 4.156 1.612.4 0 1.197-1.612 4.156-1.612 3.248 0 4.977 2.9 4.977 4.906 0 2.506-1.34 5.188-3.45 7.184-2.46 2.325-5.222 3.844-5.684 3.844z"
        fill="url(#paint0_linear_1842_4711)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_1842_4711"
          x1={15.6852}
          y1={7.82723}
          x2={15.6852}
          y2={23.7611}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FF61AD" />
          <Stop offset={1} stopColor="#FF2616" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default AppleHealth;
