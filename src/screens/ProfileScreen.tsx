import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { tID } from '../common/testID';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { useActiveConfig } from '../hooks';
import { useSession } from '../hooks/useSession';

export const ProfileScreen = () => {
  const { styles } = useStyles(defaultStyles);
  const { userConfiguration, isLoaded } = useSession();
  const { user } = userConfiguration;
  const { project } = useActiveConfig();

  const userProfile = user.profile;

  if (!isLoaded) {
    return (
      <ActivityIndicatorView
        message={t('profile-loading-user', 'Loading user profile')}
      />
    );
  }

  if (!userProfile) {
    return (
      <ActivityIndicatorView
        message={t('profile-awaiting-user-data', 'Waiting on user data')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Field label={t('profile-username', 'Username')} value={user.id} />
        <Field
          label={t('profile-first-name', 'First Name')}
          value={userProfile.givenName}
        />
        <Field
          label={t('profile-last-name', 'Last Name')}
          value={userProfile.familyName}
        />
        <Field label={t('profile-email', 'Email')} value={userProfile.email} />
        {__DEV__ && <Field label="Active Project" value={project?.name} />}
      </ScrollView>
    </SafeAreaView>
  );
};

interface FieldProps {
  label: string;
  value?: string;
}

const Field = ({ label, value }: FieldProps) => {
  const { styles } = useStyles(defaultStyles);

  if (!(typeof value === 'string' && value.length)) {
    return null;
  }

  return (
    <View style={styles.fieldView} testID={tID(label)}>
      <Text variant="labelMedium" style={styles.fieldLabelText}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={styles.fieldValueText}>
        {value}
      </Text>
    </View>
  );
};

const defaultStyles = createStyles('ProfileScreen', (theme) => ({
  container: {
    marginHorizontal: 24,
  },
  fieldView: {
    margin: 12,
    backgroundColor: theme.colors.surface,
  },
  fieldLabelText: {
    color: theme.colors.tertiary,
  },
  fieldValueText: {
    color: theme.colors.onBackground,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ProfileScreenStyles = NamedStylesProp<typeof defaultStyles>;
