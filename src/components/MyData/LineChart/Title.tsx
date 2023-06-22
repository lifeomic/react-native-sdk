import React from 'react';
import { Trace } from './TraceLine';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { Svg, Line, Circle } from 'react-native-svg';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { defaultChartStyles } from '../styles';

type Props = {
  title: string;
  trace1: Trace;
  trace2?: Trace;
};

export const Title = (props: Props) => {
  const { title, trace1, trace2 } = props;
  const { styles } = useStyles(defaultStyles);
  const { styles: chartStyles } = useStyles(defaultChartStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText} variant="titleLarge">
        {title}
      </Text>
      <View style={styles.traceContainer}>
        <DotLine color={trace1.color ?? chartStyles.colors?.trace1} />
        <Text style={styles.traceLabelText}>{trace1.label}</Text>
        {trace2 && (
          <>
            <DotLine color={trace2.color ?? chartStyles.colors?.trace2} />
            <Text style={styles.traceLabelText}>{trace2.label}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const DotLine = ({ color }: { color?: string }) => (
  <Svg width={44} height={12}>
    <Line x1={0} y1={6} x2={44} y2={6} strokeWidth={2} stroke={color} />
    <Circle x={22} y={6} r={6} fill={color} />
  </Svg>
);

const defaultStyles = createStyles('LineChartTitle', () => ({
  container: {
    alignItems: 'flex-start',
  },
  titleText: {
    fontWeight: '700',
    paddingBottom: 5,
  },
  traceContainer: { flexDirection: 'row', alignItems: 'center' },
  traceLabelText: {
    paddingLeft: 10,
    paddingRight: 20,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
