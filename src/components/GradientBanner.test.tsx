import React from 'react';
import { render } from '@testing-library/react-native';
import GradientBanner from './GradientBanner';

test('renders with text', () => {
  const bannerText = 'Congratulations!';
  const color1 = '#FFFFF';
  const color2 = '#00000';
  const screen = render(
    <GradientBanner text={bannerText} gradientColors={[color1, color2]} />,
  );
  expect(screen.getByText(bannerText)).toBeDefined();
});
