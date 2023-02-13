import React, { FC } from 'react';
import { I18nManager, Image, StyleSheet, View } from 'react-native';
import i18n from 'lib/i18n';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacityDebounced } from './TouchableOpacityDebounced';

import { scale } from 'src/common/utils/screen';
import Images from 'src/common/img';

const styles = StyleSheet.create({
  iconStyle: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF', // white
  },
  editAction: {
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: '#FD2727', // red
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#FECA2F', // yellow
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  swipeContainer: {
    backgroundColor: '#FFFFFF', // white
  },
});

type SwipeableRowProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  testID?: string;
  disabled?: boolean;
} & React.PropsWithChildren;

type EditActionProps = {
  disabled?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  closeSwipeable?: () => void;
};

const EditActions: FC<EditActionProps> = (props) => {
  const { closeSwipeable, onEdit, onDelete, disabled } = props;
  const editAndClose = () => {
    onEdit?.();
    closeSwipeable?.();
  };
  const deleteAndClose = () => {
    onDelete?.();
    closeSwipeable?.();
  };

  return (
    <View style={styles.editAction}>
      {onEdit && (
        <TouchableOpacityDebounced
          onPress={editAndClose}
          style={styles.editButton}
          testID="swipeEdit"
          accessibilityRole="button"
          accessibilityLabel="item-swipe-edit-button"
          disabled={disabled}
        >
          <Image
            accessibilityLabel={i18n.t('edit-item', {
              defaultValue: 'Edit Item',
            })}
            style={styles.iconStyle}
            source={Images.buttons.edit}
            resizeMode={'center'}
          />
        </TouchableOpacityDebounced>
      )}
      <TouchableOpacityDebounced
        onPress={deleteAndClose}
        style={styles.deleteButton}
        testID="swipeDelete"
        accessibilityRole="button"
        accessibilityLabel="item-swipe-delete-button"
        disabled={disabled}
      >
        <Image
          accessibilityLabel={i18n.t('delete-item', {
            defaultValue: 'Delete Item',
          })}
          style={styles.iconStyle}
          source={Images.buttons.delete}
          resizeMode={'center'}
        />
      </TouchableOpacityDebounced>
    </View>
  );
};

export const SwipeableRow: FC<SwipeableRowProps> = (
  props: SwipeableRowProps,
) => {
  const renderEditActions = () => <EditActions />;
  return (
    <Swipeable
      friction={2}
      rightThreshold={scale(60)}
      renderRightActions={I18nManager.isRTL ? undefined : renderEditActions}
      leftThreshold={scale(60)}
      renderLeftActions={I18nManager.isRTL ? renderEditActions : undefined}
      childrenContainerStyle={styles.swipeContainer}
    >
      {props.children}
    </Swipeable>
  );
};
