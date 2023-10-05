import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useUser } from '../hooks/useUser';
import { tID } from '../common/testID';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { useActiveProject, useMe } from '../hooks';

export const FhirProfileView = () => {
  const { isLoading, data } = useMe();

  const subject = data?.[0].subject;

  if (isLoading) {
    return (
      <ActivityIndicatorView
        message={t('profile-loading-user', 'Loading user profile')}
      />
    );
  }

  if (!subject) {
    return (
      <ActivityIndicatorView
        message={t('profile-awaiting-user-data', 'Waiting on user data')}
      />
    );
  }

  const name = subject.name?.[0];
  const address = subject.address?.[0];

  return (
    <>
      <Field
        label={t('fhir-profile-first-name', 'First Name')}
        value={name?.given?.[0]}
      />
      <Field
        label={t('fhir-profile-last-name', 'Last Name')}
        value={name?.family}
      />
      <Field
        label={t('fhir-profile-gender-identity', 'Gender Identity')}
        // TODO: improve the display of this gender.
        value={subject.gender}
      />
      <Field
        label={t('fhir-profile-address', 'Address')}
        value={address?.line?.[0]}
      />
      <Field label={t('fhir-profile-city', 'City')} value={address?.city} />
      <Field
        label={t('fhir-profile-zip-code', 'Zip Code')}
        value={address?.postalCode}
      />
      <Field
        label={t('fhir-profile-mobile-number', 'Mobile Number')}
        value={subject.telecom?.find((t) => t.system === 'phone')?.value}
      />
      <Field
        label={t('fhir-profile-email', 'Email Address')}
        value={subject.telecom?.find((t) => t.system === 'email')?.value}
      />
    </>
  );
};
export const ProfileScreen = () => {
  const { styles } = useStyles(defaultStyles);
  const { isLoading, data } = useUser();
  const { activeProject } = useActiveProject();

  const userProfile = data?.profile;

  if (isLoading) {
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
        <Field label={t('profile-username', 'Username')} value={data.id} />
        <Field
          label={t('profile-first-name', 'First Name')}
          value={userProfile.givenName}
        />
        <Field
          label={t('profile-last-name', 'Last Name')}
          value={userProfile.familyName}
        />
        <Field label={t('profile-email', 'Email')} value={userProfile.email} />
        {__DEV__ && (
          <Field label="Active Project" value={activeProject?.name} />
        )}
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
