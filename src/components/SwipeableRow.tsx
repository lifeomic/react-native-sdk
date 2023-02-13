import React, { Component } from 'react';
import { I18nManager, Image, StyleSheet, View } from 'react-native';
import i18n from 'lib/i18n';
import colors from 'src/common/utils/colors';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacityDebounced } from './Button';

import { scale } from 'src/common/utils/screen';
import Images from 'src/common/img';

const styles = StyleSheet.create({
  iconStyle: {
    width: 34,
    height: 34,
    tintColor: colors.white,
  },
  editAction: {
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  deleteButton: {
    backgroundColor: colors.destructiveRed,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.warningYellow,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  swipeContainer: {
    backgroundColor: colors.white,
  },
});

interface SwipeableRowProps {
  onEdit?: () => void;
  onDelete?: () => void;
  testID?: string;
  disabled?: boolean;
}

export default class SwipeableRow extends Component<SwipeableRowProps> {
  _swipeableRow: any;

  renderEditActions = () => {
    const { disabled } = this.props;
    return (
      <View style={styles.editAction}>
        {this.props.onEdit && (
          <TouchableOpacityDebounced
            onPress={this.edit}
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
          onPress={this.delete}
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

  updateRef: React.LegacyRef<Swipeable> = (ref) => {
    this._swipeableRow = ref;
  };
  close = () => {
    if (this._swipeableRow) {
      this._swipeableRow.close();
    }
  };
  edit = () => {
    if (this.props.onEdit) {
      this.props.onEdit();
    }
    this.close();
  };
  delete = () => {
    if (this.props.onDelete) {
      this.props.onDelete();
    }
    this.close();
  };
  render() {
    const { children } = this.props as any;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        rightThreshold={scale(60)}
        renderRightActions={
          I18nManager.isRTL ? undefined : this.renderEditActions
        }
        leftThreshold={scale(60)}
        renderLeftActions={
          I18nManager.isRTL ? this.renderEditActions : undefined
        }
        childrenContainerStyle={styles.swipeContainer}
      >
        {children}
      </Swipeable>
    );
  }
}
