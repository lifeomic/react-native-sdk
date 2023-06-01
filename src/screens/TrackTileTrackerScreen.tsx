import React from 'react';
import { View } from 'react-native';
import { TrackerDetails } from '../components/TrackTile/TrackerDetails/TrackerDetails';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/types';
import { t } from '../../lib/i18n';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/TrackTile'>;

export const TrackTileTrackerScreen = ({
  navigation,
  route: { params },
}: Props) => {
  const { tracker, valuesContext, referenceDate } = params;
  const { styles } = useStyles(defaultStyles);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Track {{name}}', { name: tracker?.name }),
    });
  });

  return (
    <View style={styles.container}>
      <TrackerDetails
        tracker={tracker}
        valuesContext={valuesContext}
        referenceDate={referenceDate}
        canEditUnit={true}
      />
    </View>
  );
};

const defaultStyles = createStyles('TrackTileSettingsScreen', () => ({
  container: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default TrackTileTrackerScreen;
