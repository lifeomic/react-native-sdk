import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { BrandConfigProvider } from 'src';
import { View, ViewStyle } from 'react-native';
import { text, object } from '@storybook/addon-knobs';
import { Theme } from 'src/components/BrandConfigProvider/Theme';
import { Styles } from 'src/components/BrandConfigProvider/Styles';
import { Examples } from './Examples';
import { TextStyles } from 'src/components/Text/TextStyles';

const defaultTextContent = 'Example text content.';

const centerView: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

storiesOf('Brand Config', module)
  .addDecorator((story) => <View style={centerView}>{story()}</View>)

  .add('Basic', () => {
    const content = text('Text Content', defaultTextContent);

    return (
      <BrandConfigProvider>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  })

  .add('Custom theme', () => {
    const content = text('Text Content', defaultTextContent);

    const themeConfig = object('Theme', {
      colors: {
        text: 'blue',
      },
    });

    const theme = new Theme(themeConfig);

    return (
      <BrandConfigProvider theme={theme}>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  })

  .add('Custom styles', () => {
    const content = text('Text Content', defaultTextContent);

    const customTextStyles = object('Custom Text Styles', {
      body: {
        color: 'red',
      },
      heading: {
        color: 'green',
      },
      subHeading: {
        color: 'blue',
      },
    });

    const styles = new Styles();
    styles.Text.mergeStyles(customTextStyles);

    return (
      <BrandConfigProvider styles={styles}>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  })

  .add('Theme and styles', () => {
    const content = text('Text Content', defaultTextContent);

    const themeConfig = object('Theme', {
      colors: {
        text: 'black',
      },
    });

    const theme = new Theme(themeConfig);

    const customTextStyles: Partial<TextStyles> = object('Custom Text Styles', {
      body: {
        fontStyle: 'italic',
      },
      heading: {
        color: 'purple',
      },
    });

    const styles = new Styles({ theme });
    styles.Text.mergeStyles(customTextStyles);

    return (
      <BrandConfigProvider styles={styles}>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  });
