import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import {
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
  StopProps,
  PathProps,
} from 'react-native-svg';
import _ from 'lodash';

const { width: windowWidth } = Dimensions.get('window');
const styles = StyleSheet.create({
  viewContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginVertical: 9,
  },
  labelText: {
    color: '#FFFFFF',
    marginBottom: 4,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  svgContainer: { position: 'absolute' },
});

// we need to draw the section according to the window's width in order to get a responsive svg image
const axisXdistance = 9.2122;
let initialPoint = 6.46432;
const curvesSectionsAtWidth: string[] = [];

const curvesSequenceTimes = _.times(windowWidth / (axisXdistance * 3));
curvesSequenceTimes.forEach(() => {
  const pointOne = initialPoint + axisXdistance;
  const pointTwo = pointOne + axisXdistance;
  const pointThree = pointTwo + axisXdistance;
  const drawingSection = `28.8198 ${initialPoint} 28.8198C${pointOne} 28.8198 ${pointOne} 33.5847 ${pointTwo} 33.5847C${pointThree} 33.5847 ${pointThree}`;
  curvesSectionsAtWidth.push(drawingSection);
  initialPoint = pointThree + axisXdistance;
});
const drawingSectionString = curvesSectionsAtWidth.join(',').replace(',', ' ');
const path: PathProps['d'] = `M${windowWidth} 0.44751H0.666992V30.011C2.2553 29.2963 4.08186 ${drawingSectionString} 28.8198 ${initialPoint} 28.8198V0.44751H${windowWidth}Z`;

const SocialBanner = ({
  gradientColors,
  text,
}: {
  gradientColors: Array<StopProps['stopColor']>;
  text: string | null;
}) => {
  const height = 34;

  return (
    <View style={styles.viewContainer}>
      <Svg
        style={styles.svgContainer}
        width={windowWidth}
        height={height}
        viewBox={`1 0 ${windowWidth} ${height}`}
        fill="none"
      >
        <Path d={path} fill="url(#paint0_linear)" fill-opacity="0.88" />
        <Defs>
          <LinearGradient
            id="paint0_linear"
            x1="188.167"
            y1="0.44751"
            x2="188.167"
            y2="33.5847"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor={gradientColors[0]} />
            <Stop offset="1" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
      </Svg>
      <Text style={styles.labelText}>{text}</Text>
    </View>
  );
};

export default SocialBanner;
