import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedbackProps,
  View,
  GestureResponderEvent,
  TextStyle,
} from 'react-native';
import debounce from 'lodash/debounce';

import colors from 'src/common/utils/colors';
import { textStyles } from 'src/common/utils/text';

const styles = StyleSheet.create({
  linkButtonText: {
    color: colors.textLightBlue,
    fontSize: 17,
    textAlign: 'center',
  },
});

const disabledTextStyle = (disabled?: boolean): TextStyle =>
  disabled ? { color: colors.disabledText } : {};

interface DebouncedTouchableProps extends TouchableWithoutFeedbackProps {
  shouldDebounce?: boolean;
  debounceTime?: number;
  title?: string;
  onPress?: (event: GestureResponderEvent) => any;
  activeOpacity?: number;
}

export function DebouncedTouchable<T extends DebouncedTouchableProps>(
  // @ts-expect-error TODO: figure out type
  TouchableElement,
) {
  return class WrappedButton extends React.Component<T, {}> {
    public static defaultProps = {
      shouldDebounce: true,
      debounceTime: 750,
    };

    debouncedOnPress: (evt: GestureResponderEvent) => {};
    constructor(props: T) {
      super(props);
      const { debounceTime } = props;
      this.debouncedOnPress = debounce(
        (arg) => {
          if (this.props.onPress) {
            return this.props.onPress(arg);
          }
        },
        debounceTime,
        {
          leading: true,
          trailing: false,
        },
      );
    }

    maybeDebounce = (evt: GestureResponderEvent) => {
      const { shouldDebounce = true, onPress } = this.props;

      if (shouldDebounce) {
        return this.debouncedOnPress(evt);
      } else if (onPress) {
        return onPress(evt);
      }
    };

    render() {
      return <TouchableElement {...this.props} onPress={this.maybeDebounce} />;
    }
  };
}

export const TouchableOpacityDebounced =
  DebouncedTouchable<DebouncedTouchableProps>(TouchableOpacity);

export enum ButtonColors {
  blue = 'blue',
  white = 'white',
}

const buttonStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 8.96,
    paddingVertical: 5.734,
    borderRadius: 2,
  },
  baseText: {
    color: 'white',
  },

  [ButtonColors.blue]: {
    backgroundColor: colors.lifeBlue,
  },

  [ButtonColors.white]: {
    backgroundColor: colors.white,
  },
});

interface LinkButtonProps extends TouchableWithoutFeedbackProps {
  title: string;
  textStyle?: TextStyle;
}

export class LinkButtonBase extends React.PureComponent<LinkButtonProps, {}> {
  render() {
    const { title, textStyle, ...touchableProps } = this.props;
    return (
      <TouchableOpacity {...touchableProps} accessibilityRole="link">
        <Text
          style={[
            styles.linkButtonText,
            textStyle,
            disabledTextStyle(touchableProps.disabled ?? false),
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

interface ButtonProps extends TouchableWithoutFeedbackProps {
  children?: any;
  title?: string;
  color?: ButtonColors;
  styleOverrides?: any;
}

export const Button: React.FunctionComponent<ButtonProps> = (
  props: ButtonProps,
) => {
  const {
    children,
    color = ButtonColors.blue,
    title,
    styleOverrides,
    ...touchableProps
  } = props;
  const buttonContent = children || title;

  let Container: typeof Text | typeof View;
  if (typeof buttonContent === 'string') {
    Container = Text;
  } else {
    Container = View;
  }

  const baseStyles = [buttonStyles.base, buttonStyles[color]];

  return (
    <TouchableOpacityDebounced {...touchableProps}>
      <View style={StyleSheet.compose(baseStyles, styleOverrides)}>
        {/* @ts-expect-error TODO: figure out type */}
        <Container style={[buttonStyles.baseText, textStyles.bold]}>
          {buttonContent}
        </Container>
      </View>
    </TouchableOpacityDebounced>
  );
};

export const LinkButton = DebouncedTouchable<LinkButtonProps>(LinkButtonBase);
