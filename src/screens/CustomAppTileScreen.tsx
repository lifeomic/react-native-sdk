import React, { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';
import { t } from 'i18next';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { getCustomAppTileComponent } from '../common/DeveloperConfig';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { tID } from '../common/testID';
import { HomeStackScreenProps } from '../navigators/types';

export const CustomAppTileScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/CustomAppTile'>) => {
  const { appTileScreens } = useDeveloperConfig();
  const appTile = route.params.appTile;
  const CustomAppTileComponent = getCustomAppTileComponent(
    appTileScreens,
    appTile,
  );
  const { styles } = useStyles(defaultStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.appTile.title,
    });
  }, [navigation, route.params.appTile.title]);

  if (CustomAppTileComponent) {
    return <CustomAppTileComponent />;
  }

  return (
    <View style={styles.errorView} testID={tID('custom-app-tile-error')}>
      <Text style={styles.errorLabel}>
        {t(
          'custom-app-tile-screen-error',
          'An error occurred. Please try again.',
        )}
      </Text>
    </View>
  );
};

const defaultStyles = createStyles('CustomAppTileScreen', (theme) => ({
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorLabel: {
    textAlign: 'center',
    fontSize: theme.fonts.displaySmall.fontSize,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CustomAppTileScreenStyles = NamedStylesProp<typeof defaultStyles>;
