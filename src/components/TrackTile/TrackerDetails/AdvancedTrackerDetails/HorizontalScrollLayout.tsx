import React from 'react';
import {
  StyleSheet,
  View,
  ImageSourcePropType,
  ViewProps,
  FlatList,
  Platform,
  Dimensions
} from 'react-native';

export interface QuickAddProps {
  title: string;
  image: ImageSourcePropType;
  context: any;
  onPress: (context: any) => void;
  isSelected?: boolean;
}

const windowWidth = Dimensions.get('window').width;
const sizeCutoff = 340;
export const itemMinWidth = Math.floor(
  windowWidth / (windowWidth > sizeCutoff ? 2.5 : 2)
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginVertical: 20
  },
  containerSingleItem: {
    flex: 1,
    justifyContent: 'center'
  },
  leftItem: {
    marginHorizontal: 12 / 2
  },
  rightItem: {
    marginStart: 12 / 2
  },
  centerItem: {
    marginHorizontal: 12 / 2
  },
  list: {
    overflow: 'visible'
  },
  tile: {
    backgroundColor: 'white',
    marginVertical: 12 / 2,
    borderRadius: 5,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowColor: 'black',
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 4
        }
      },
      android: {
        elevation: 4
      }
    })
  }
});

const renderItem = (count: number) => {
  const listItem = ({ item, index }: { item: JSX.Element; index: number }) => {
    let layoutStyle;
    if (index === 0) {
      layoutStyle = styles.leftItem;
    } else if (index === count - 1) {
      layoutStyle = styles.rightItem;
    } else {
      layoutStyle = styles.centerItem;
    }
    return (
      <View style={[layoutStyle, { minWidth: itemMinWidth }]}>{item}</View>
    );
  };

  return listItem;
};

const HorizontalScrollLayout: React.FC<ViewProps> = (props) => {
  const data = React.Children.map(props.children, (item) => (
    <View style={styles.tile}>{item}</View>
  ));

  return (
    <FlatList
      horizontal
      contentContainerStyle={[
        styles.container,
        data?.length === 1 && styles.containerSingleItem,
        props.style
      ]}
      style={styles.list}
      data={data}
      renderItem={renderItem(data?.length || 0)}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={(data?.length || 0) > 1}
    />
  );
};

export default HorizontalScrollLayout;
