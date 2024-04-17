import * as React from 'react';
import { Appbar, Drawer, IconButton, Portal } from 'react-native-paper';
import { useAppConfig, useAppConfigList } from '../hooks/useAppConfig';
import { Modal, NativeEventEmitter, View } from 'react-native';
import { createStyles } from './BrandConfigProvider/styles/createStyles';
import { useStyles } from '../hooks/useStyles';
import { useIcons } from './BrandConfigProvider';

const eventEmitter = new NativeEventEmitter({
  addListener: () => {},
  removeListeners: () => {},
});

const showAppConfigSwitcher = 'showAppConfigSwitcher';

export const emitShowAppConfigSwitcher = () =>
  eventEmitter.emit(showAppConfigSwitcher);

const AppConfigSwitcher = () => {
  const configs = useAppConfigList();
  const { setAppConfigId, appConfigId } = useAppConfig();
  const [active, setActive] = React.useState(appConfigId);
  const [visible, setVisible] = React.useState(false);

  const hideModal = () => setVisible(false);
  const { styles } = useStyles(defaultStyles);
  const { ArrowLeft } = useIcons();

  React.useEffect(() => {
    const subscription = eventEmitter.addListener(showAppConfigSwitcher, () => {
      setVisible(true);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        animationType={'slide'}
        style={styles.modal}
      >
        <View style={styles.container}>
          <Appbar.Header style={styles.header}>
            <IconButton onPress={() => hideModal()} icon={ArrowLeft} />
          </Appbar.Header>
          <Drawer.Section
            title="Adaptive Experiences: Tailored by Cohort"
            showDivider={true}
            titleMaxFontSizeMultiplier={4}
          >
            {configs?.map((config) => (
              <Drawer.Item
                key={config.id}
                label={config.name}
                active={active === config.id}
                style={styles.itemText}
                onPress={() => {
                  setActive(config.id);
                  setAppConfigId(config.id);
                  setVisible(false);
                }}
              />
            ))}
          </Drawer.Section>
        </View>
      </Modal>
    </Portal>
  );
};

export default AppConfigSwitcher;

const defaultStyles = createStyles('AppConfigSwitcher', (theme) => ({
  modal: {
    marginTop: 100,
    marginBottom: 0,
  },
  container: {
    height: '100%',
    flex: 1,
  },
  header: {},
  titleText: {
    ...theme.fonts.headlineMedium,
  },
  itemText: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type AppConfigSwitcher = NamedStylesProp<typeof defaultStyles>;
