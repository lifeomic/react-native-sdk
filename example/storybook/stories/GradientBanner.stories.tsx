import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { text, color } from '@storybook/addon-knobs';
import GradientBanner from 'src/components/GradientBanner';

storiesOf('SocialBanner', module).add('demo', () => {
  const gradientColor1 = color('gradientColor1', 'red');
  const gradientColor2 = color('gradientColor2', 'orange');
  const message = text('message', 'Today is national pie day.');

  return (
    <GradientBanner
      gradientColors={[gradientColor1, gradientColor2]}
      text={message}
    />
  );
});
