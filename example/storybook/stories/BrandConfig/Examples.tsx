import React from 'react';

import { Text as RNText, TextStyle } from 'react-native';
import { Text } from '../../../../src/components/Text';
import { View, ViewStyle } from 'react-native';

interface Props {
  content: string;
}

export function Examples({ content }: Props) {
  return (
    <>
      <Container description="heading">
        <Text variant="heading">{content}</Text>
      </Container>
      <Container description="subHeading">
        <Text variant="subHeading">{content}</Text>
      </Container>
      <Container description="body">
        <Text variant="body">{content}</Text>
      </Container>
    </>
  );
}

interface ContainerProps {
  description: string;
  children: React.ReactNode;
}

function Container({ description, children }: ContainerProps) {
  const containerStyle: ViewStyle = {
    margin: 12,
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
