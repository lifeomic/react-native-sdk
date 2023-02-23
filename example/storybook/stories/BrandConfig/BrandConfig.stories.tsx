import React from 'react';

import { storiesOf } from '@storybook/react-native';
import { Text as RNText, TextStyle } from 'react-native';
import { Text } from 'src/components/Text';
import { BrandConfigProvider, BrandConfig } from 'src';
import { View, ViewStyle } from 'react-native';
import { text, object } from '@storybook/addon-knobs';

const defaultTextContent = 'Example text content.';

const centerView: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

function Container({ description, children }) {
  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };
  const descriptionStyle: TextStyle = { fontStyle: 'italic' };
  const contentStyle: ViewStyle = { padding: 0, marginVertical: 4 };

  return (
    <View style={containerStyle}>
      <RNText style={descriptionStyle}>{description}:</RNText>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

function Examples({ content }) {
  return (
    <>
      <Container description="default">
        <Text>{content}</Text>
      </Container>
      <Container description="body">
        <Text variant="body">{content}</Text>
      </Container>
      <Container description="heading">
        <Text variant="heading">{content}</Text>
      </Container>
      <Container description="subHeading">
        <Text variant="subHeading">{content}</Text>
      </Container>
    </>
  );
}

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

    const theme = object('Theme', {
      colors: {
        text: 'blue',
      },
    });

    return (
      <BrandConfigProvider theme={theme}>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  })

  .add('Custom style', () => {
    const content = text('Text Content', defaultTextContent);

    const styles: BrandConfig['styles'] = object('Styles', {});

    return (
      <BrandConfigProvider styles={styles}>
        <Examples content={content} />
      </BrandConfigProvider>
    );
  });
