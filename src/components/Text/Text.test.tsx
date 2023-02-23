import React from 'react';

import { render, screen } from '@testing-library/react-native';
import { Text } from './Text';
import { BrandConfigProvider } from '../BrandConfigProvider';
import { colors } from '../../themes/default';
import { Styles } from '../BrandConfigProvider/Styles';

describe('Without configuration', () => {
  test('Renders text with default style (baseTheme.colors.text)', () => {
    render(<Text>Hello World!</Text>);

    expect(screen.getByText('Hello World!')).toBeDefined();
    expect(screen.toJSON()).toMatchInlineSnapshot(textSnapshot(colors.text));
  });
});

describe('With configuration', () => {
  const customAppStyles = new Styles();
  customAppStyles.Text.mergeStyles({
    body: { color: 'green' },
    heading: { color: 'blue', fontWeight: 'bold' },
  });

  test('Renders text with configured style', () => {
    render(
      <BrandConfigProvider styles={customAppStyles}>
        <Text>Hello World!</Text>
      </BrandConfigProvider>,
    );

    expect(screen.toJSON()).toMatchInlineSnapshot(textSnapshot('green'));
  });

  test('Accepts a variant', () => {
    render(
      <BrandConfigProvider styles={customAppStyles}>
        <Text variant="heading">Hello World!</Text>
      </BrandConfigProvider>,
    );

    expect(screen.toJSON()).toMatchInlineSnapshot(textBoldSnapshot('blue'));
  });
});

const textSnapshot = (color: string) => `
<Text
  style={
    {
      "color": "${color}",
    }
  }
>
  Hello World!
</Text>
`;

const textBoldSnapshot = (color: string) => `
<Text
  style={
    {
      "color": "${color}",
      "fontWeight": "bold",
    }
  }
>
  Hello World!
</Text>
`;