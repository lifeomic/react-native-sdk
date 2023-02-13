import { Platform, StyleSheet } from 'react-native';

export const textStyles = StyleSheet.create({
  // font
  regular: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  medium: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      android: {
        fontFamily: '.sans-serif-medium',
      },
    }),
  },
  lightWeight: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '300',
      },
      android: {
        fontFamily: '.sans-serif-light',
      },
    }),
  },
  semibold: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  bold: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
    fontWeight: 'bold',
  },
  monospace: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
        // Because Typescript - If used add <fontVariant: ['tabular-nums']> to your text
      },
      android: {
        fontFamily: 'RobotoMono-Bold',
      },
    }),
  },

  // size
  body: {
    fontSize: 17,
  },
  caption: {
    fontSize: 15,
  },
  subHeader: {
    fontSize: 13,
  },
  header: {
    fontSize: 34,
  },
  title: {
    fontSize: 22,
  },
  tileCaption: {
    fontSize: 11,
  },
  twentyFour: {
    fontSize: 24,
  },
  twelve: {
    fontSize: 12,
  },
  ten: {
    fontSize: 10,
  },
});
