import { Dimensions, Platform } from 'react-native';

export const X_WIDTH = 375;
export const X_HEIGHT = 812;
export const XSMAX_WIDTH = 414;
export const XSMAX_HEIGHT = 896;
export const TWELVE_PRO_WIDTH = 390;
export const TWELVE_PRO_HEIGHT = 844;
export const TWELVE_PRO_MAX_WIDTH = 428;
export const TWELVE_PRO_MAX_HEIGHT = 926;
const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

export const iPhoneXStatusBarHeight = 44;

export interface ScreenMetrics {
  screenWidth: number;
  screenHeight: number;
}

export const metrics: ScreenMetrics = {
  screenWidth: D_WIDTH,
  screenHeight: D_HEIGHT,
};

export const isIPhoneX = () => {
  return (
    (Platform.OS === 'ios' &&
      ((metrics.screenHeight === X_HEIGHT && metrics.screenWidth === X_WIDTH) ||
        (metrics.screenHeight === X_WIDTH &&
          metrics.screenWidth === X_HEIGHT))) ||
    (metrics.screenHeight === XSMAX_HEIGHT &&
      metrics.screenWidth === XSMAX_WIDTH) ||
    (metrics.screenHeight === XSMAX_WIDTH &&
      metrics.screenWidth === XSMAX_HEIGHT)
  );
};

export const isIPhone12Pro = () => {
  return (
    (Platform.OS === 'ios' &&
      ((metrics.screenHeight === TWELVE_PRO_HEIGHT &&
        metrics.screenWidth === TWELVE_PRO_WIDTH) ||
        (metrics.screenHeight === TWELVE_PRO_WIDTH &&
          metrics.screenWidth === TWELVE_PRO_HEIGHT))) ||
    (metrics.screenHeight === TWELVE_PRO_MAX_HEIGHT &&
      metrics.screenWidth === TWELVE_PRO_MAX_WIDTH) ||
    (metrics.screenHeight === TWELVE_PRO_MAX_HEIGHT &&
      metrics.screenWidth === TWELVE_PRO_MAX_WIDTH)
  );
};

export function getNavBarHeight() {
  if (Platform.OS === 'ios') {
    if (isIPhoneX() || isIPhone12Pro()) {
      // iPhone X or iPhone 12 navbar height (regular title)
      return 88;
    } else {
      return 64; // iPhone navbar height
    }
  } else {
    return 54; // Android portrait navbar height
  }
}

// https://github.com/nirsky/react-native-size-matters/blob/master/lib/scaling-utils.js
// Guideline sizes are based on standard ~5" screen mobile device
const GUIDELINE_BASE_WIDTH = 350;
const GUIDELINE_BASE_HEIGHT = 680;

interface ScaleOptions {
  vertical?: boolean;
}

export const scale = (size: number, options: ScaleOptions = {}) => {
  if (!options.vertical) {
    return (metrics.screenWidth / GUIDELINE_BASE_WIDTH) * size;
  }
  return (metrics.screenHeight / GUIDELINE_BASE_HEIGHT) * size;
};
