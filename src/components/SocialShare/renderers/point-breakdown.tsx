import React from 'react';
import { Image, View, Text } from 'react-native';
import { useStyles, useTheme } from '../../../hooks';
import { createStyles } from '../../BrandConfigProvider';
import { PointData } from '../../MyData/LineChart/useChartData';
import { Renderer } from './types';
import { format, differenceInDays } from 'date-fns';
import { t } from 'i18next';

export type PointBreakdownProps = Renderer<{
  title: string;
  selectedPoints: PointData[];
  dataUri: string;
  dateRange: [Date, Date];
  Footer?: React.ReactElement;
}>;

export const PointBreakdown = (props: PointBreakdownProps) => {
  const { Footer, dateRange, dataUri, selectedPoints, title, onLoad } = props;
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();

  let dateStr = format(dateRange[0], 'yyyy');

  if (differenceInDays(...dateRange) === 0) {
    dateStr = format(dateRange[0], 'MMMM dd, yyyy');
  } else if (differenceInDays(...dateRange) <= 31) {
    dateStr = t('date-range', '{{month}} {{startDay}}-{{endDay}}, {{year}}', {
      month: format(dateRange[0], 'MMMM'),
      startDay: format(dateRange[0], 'dd'),
      endDay: format(dateRange[1], 'dd'),
      year: format(dateRange[1], 'yyyy'),
    });
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.titleContainer,
          {
            backgroundColor:
              selectedPoints?.[0]?.trace?.color ?? theme.colors.primary,
          },
        ]}
      >
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <Text style={styles.dateText}>{dateStr}</Text>
      <View style={styles.chartImageContainer}>
        <Image
          style={styles.chartImage}
          source={{ uri: dataUri }}
          onLoad={onLoad}
        />
      </View>
      <View style={styles.pointsContainer}>
        {selectedPoints?.map((point: any, i: number) => (
          <View key={i} style={styles.pointRowView}>
            <Text style={styles.pointDateText}>
              {format(new Date(point.x), 'MMM dd:')}
            </Text>
            <View style={styles.pointDataContainer}>
              <View
                style={[
                  {
                    backgroundColor:
                      point.trace.color ??
                      (i === 0 ? theme.colors.primary : theme.colors.secondary),
                  },
                  styles.pointDataCircleView,
                ]}
              >
                <Text
                  adjustsFontSizeToFit
                  style={styles.pointDataText}
                  numberOfLines={1}
                >
                  {point.y}
                </Text>
              </View>
            </View>
            <Text style={styles.pointLabel}>{point.trace.label}</Text>
          </View>
        ))}
      </View>
      {Footer}
    </View>
  );
};

export const createPointBreakdown =
  (customProps?: Partial<PointBreakdownProps>) =>
  (props: PointBreakdownProps) =>
    <PointBreakdown {...props} {...customProps} />;

const defaultStyles = createStyles('Export.LineChartBreakDown', (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    padding: 20,
    paddingTop: 40,
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  dateText: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 16,
    marginTop: 42,
  },
  chartImageContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  chartImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  pointsContainer: {
    borderColor: 'black',
    borderBottomWidth: 1,
    width: '100%',
  },
  pointRowView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderColor: 'black',
    borderTopWidth: 1,
    width: '100%',
  },
  pointDateText: { flex: 2, textTransform: 'uppercase' },
  pointDataContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pointDataCircleView: {
    height: 59,
    width: 59,
    borderRadius: 59,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointDataText: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
  },
  pointLabel: { flex: 2, textAlign: 'right', textTransform: 'uppercase' },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
