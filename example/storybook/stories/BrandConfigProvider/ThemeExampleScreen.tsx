import React from 'react';

import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from 'src/hooks/useTheme';

export function ThemeExampleScreen() {
  const { theme } = useTheme();

  const centerView: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  };

  const blackText: TextStyle = {
    color: theme.colors.black,
  };

  const whiteText: TextStyle = {
    color: theme.colors.white,
  };

  const primaryView: ViewStyle = {
    backgroundColor: theme.colors.primary,
  };

  const secondaryView: ViewStyle = {
    backgroundColor: theme.colors.secondary,
  };

  const tileView: ViewStyle = {
    width: '63%',
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
  };

  const normalText: TextStyle = {
    color: theme.colors.text,
  };

  const dimText: TextStyle = {
    color: theme.colors.textDim,
  };

  const separatorView: ViewStyle = {
    margin: theme.spacing.large,
    width: '80%',
    height: 1,
    backgroundColor: theme.colors.separator,
  };

  const errorView: ViewStyle = {
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.errorBackground,
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: 32,
  };

  const errorText: TextStyle = {
    color: theme.colors.error,
  };

  return (
    <View style={centerView}>
      <View style={[tileView, primaryView]}>
        <Text style={whiteText}>Primary color (white text)</Text>
      </View>

      <View style={[tileView, secondaryView]}>
        <Text style={blackText}>Secondary color (black text)</Text>
      </View>

      <View style={tileView}>
        <Text style={normalText}>This is normal text color</Text>
      </View>

      <View style={tileView}>
        <Text style={dimText}>This is dim text color</Text>
      </View>

      <View style={separatorView} />

      <View style={errorView}>
        <Text style={errorText}>Error!</Text>
      </View>
    </View>
  );
}
