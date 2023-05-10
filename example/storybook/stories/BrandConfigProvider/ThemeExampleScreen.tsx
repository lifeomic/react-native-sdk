import React from 'react';

import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../../src/hooks/useTheme';

export function ThemeExampleScreen() {
  const theme = useTheme();

  const containerView: ViewStyle = {
    backgroundColor: theme.colors.background,
  };

  const primaryText: TextStyle = {
    color: theme.colors.onPrimary,
  };

  const secondaryText: TextStyle = {
    color: theme.colors.onSecondary,
  };

  const tertiaryText: TextStyle = {
    color: theme.colors.onTertiary,
  };

  const primaryView: ViewStyle = {
    backgroundColor: theme.colors.primary,
  };

  const secondaryView: ViewStyle = {
    backgroundColor: theme.colors.secondary,
  };

  const tertiaryView: ViewStyle = {
    backgroundColor: theme.colors.tertiary,
  };

  const tileView: ViewStyle = {
    minWidth: 200,
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    borderWidth: 1,
    borderRadius: theme.roundness,
    alignItems: 'center',
  };

  const normalText: TextStyle = {
    color: theme.colors.onBackground,
  };

  const disabledText: TextStyle = {
    color: theme.colors.onSurfaceDisabled,
  };

  const separatorView: ViewStyle = {
    margin: theme.spacing.large,
    width: '80%',
    height: 1,
    backgroundColor: theme.colors.outline,
  };

  const errorView: ViewStyle = {
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.onErrorContainer,
    borderWidth: 1,
    borderRadius: 32,
    alignItems: 'center',
  };

  const errorText: TextStyle = {
    color: theme.colors.onError,
  };

  return (
    <View style={containerView}>
      <View style={[tileView, primaryView]}>
        <Text style={primaryText}>Primary</Text>
      </View>

      <View style={[tileView, secondaryView]}>
        <Text style={secondaryText}>Secondary</Text>
      </View>

      <View style={[tileView, tertiaryView]}>
        <Text style={tertiaryText}>Tertiary</Text>
      </View>

      <View style={tileView}>
        <Text style={normalText}>This is normal text color</Text>
      </View>

      <View style={tileView}>
        <Text style={disabledText}>This is dim text color</Text>
      </View>

      <View style={separatorView} />

      <View style={errorView}>
        <Text style={errorText}>Error!</Text>
      </View>
    </View>
  );
}
