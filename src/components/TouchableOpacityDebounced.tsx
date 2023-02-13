import React from 'react';
import {
  TouchableOpacity,
  TouchableWithoutFeedbackProps,
  GestureResponderEvent,
} from 'react-native';
import debounce from 'lodash/debounce';

interface DebouncedTouchableProps extends TouchableWithoutFeedbackProps {
  shouldDebounce?: boolean;
  debounceTime?: number;
  title?: string;
  onPress?: (event: GestureResponderEvent) => any;
  activeOpacity?: number;
}

function DebouncedTouchable<T extends DebouncedTouchableProps>(
  TouchableElement: typeof TouchableOpacity,
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
