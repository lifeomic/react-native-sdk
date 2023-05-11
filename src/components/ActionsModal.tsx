import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  Modal,
  Button,
  List,
  Portal,
  Surface,
  Divider,
  Dialog,
  Text,
} from 'react-native-paper';
import { StyleProp, TextStyle } from 'react-native';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from './BrandConfigProvider/styles/StylesProvider';

export type Actions = {
  title: string;
  action?: () => void;
  style?: StyleProp<TextStyle>;
  promptForConfirmation?: boolean;
}[];

type ActionsModalProps = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  actions: Actions;
  subHeading?: string;
  showCancel?: boolean;
  cancelTitle?: string;
  cancelStyle?: StyleProp<TextStyle>;
};

export const ActionsModal = ({
  setShowModal,
  actions,
  subHeading,
  showCancel = true,
  cancelTitle,
  cancelStyle,
}: ActionsModalProps) => {
  const { styles } = useStyles(defaultStyles);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>();

  return (
    <Portal>
      <Modal
        onDismiss={() => setShowModal(false)}
        visible={!showConfirmation}
        style={styles.modal}
      >
        <Surface elevation={4} style={styles.surfaceStyle}>
          <List.Section>
            {subHeading && <List.Subheader>{subHeading}</List.Subheader>}
            {actions.map(
              ({ title, action, style, promptForConfirmation }, index) => (
                <>
                  <List.Item
                    key={title}
                    title={title}
                    onPress={() => {
                      if (promptForConfirmation) {
                        setConfirmationAction(() => action);
                        setShowConfirmation(true);
                      } else if (promptForConfirmation === false) {
                        action?.();
                      }
                    }}
                    titleStyle={[styles.label, style]}
                  />
                  {index < actions.length - 1 && <Divider />}
                </>
              ),
            )}
          </List.Section>
        </Surface>
        {showCancel && (
          <Surface elevation={4} style={styles.surfaceStyle}>
            <List.Section>
              <List.Item
                title={cancelTitle ?? 'Cancel'}
                onPress={() => {
                  setShowModal(false);
                }}
                titleStyle={[styles.label, cancelStyle]}
              />
            </List.Section>
          </Surface>
        )}
      </Modal>
      <Dialog visible={showConfirmation} onDismiss={() => setShowModal(false)}>
        <Dialog.Title>Are you sure?</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">This action can not be undone.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowModal(false)}>Cancel</Button>
          <Button
            onPress={() => {
              confirmationAction?.();
              setShowModal(false);
            }}
          >
            Ok
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const defaultStyles = createStyles('ActionsModal', () => ({
  modal: {
    marginTop: '100%',
    paddingTop: '60%',
    flex: 1,
  },
  label: {
    textAlign: 'center',
  },
  surfaceStyle: {
    flexShrink: 1,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 16,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ActionsModal = NamedStylesProp<typeof defaultStyles>;
