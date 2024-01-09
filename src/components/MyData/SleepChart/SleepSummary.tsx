import React, { useMemo } from 'react';
import { SleepChartData } from './useSleepChartData';
import { ColorValue, StyleSheet, View } from 'react-native';
import { Svg, Path, ForeignObject } from 'react-native-svg';
import {
  Badge,
  Divider,
  MD3TypescaleKey,
  Text,
  TextProps,
} from 'react-native-paper';
import { differenceInMinutes } from 'date-fns';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import { ActivityIndicatorView } from '../../ActivityIndicatorView';
import { SleepType, useSleepDisplay } from './useSleepDisplay';
import { t } from 'i18next';
import { ComponentNamedStyles, createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

type Props = SleepChartData;

export const SleepSummary = (props: Props) => {
  const { sleepData, isFetching } = props;
  const toDisplay = useSleepDisplay();
  const { styles } = useStyles(defaultStyles);

  const groupedData = useMemo(() => {
    const data = groupBy(
      sleepData.flatMap((d) => d.component),
      (d) => toDisplay(d?.code).codeType,
    ) as Partial<Record<SleepType, fhir3.ObservationComponent[]>>;

    delete data.default;

    return mapValues(data, (obs = [], key) => ({
      duration: obs.reduce(
        (total, v) => total + timeInMinutes(v?.valuePeriod),
        0,
      ),
      ...toDisplay(key as SleepType),
    }));
  }, [sleepData, toDisplay]);

  return (
    <View>
      <RadialChart data={Object.values(groupedData)} />
      <View style={styles.summaryValuesContainer}>
        <View style={styles.summaryValueRowContainer}>
          <SummaryValue {...toDisplay('deep')} {...groupedData.deep} />
          <SummaryValue {...toDisplay('rem')} {...groupedData.rem} />
        </View>
        <View style={styles.summaryValueRowContainer}>
          <SummaryValue {...toDisplay('light')} {...groupedData.light} />
          <SummaryValue {...toDisplay('awake')} {...groupedData.awake} />
        </View>
      </View>

      <ActivityIndicatorView
        animating={isFetching}
        style={{ view: StyleSheet.absoluteFillObject }}
      />
    </View>
  );
};

const timeInMinutes = (p?: fhir3.Period) => {
  return !p?.start || !p.end
    ? 0
    : differenceInMinutes(new Date(p.end), new Date(p.start));
};

type DurationTextComponent = <T extends keyof typeof MD3TypescaleKey>(
  props: Omit<TextProps<T>, 'children'> & { duration?: number },
) => React.JSX.Element;

const DurationText: DurationTextComponent = ({ duration, ...textProps }) => {
  let text = t('sleep-analysis-missing-value', '--');

  if (typeof duration === 'number') {
    const days = Math.floor(duration / 60 / 24);
    const hours = Math.floor(duration / 60) % 24;
    const minutes = duration % 60;

    text = t(
      'sleep-analysis-sleep-amount-with-prefix',
      '{{prefix}}{{hours}}h {{minutes}}m',
      {
        hours,
        minutes,
        prefix:
          days > 0
            ? t('sleep-analysis-sleep-amount-days', '{{days}}d ', {
                days,
              })
            : '',
      },
    );
  }

  return <Text {...textProps}>{text}</Text>;
};

const SummaryValue = (props: {
  duration?: number;
  color: string;
  name: string;
}) => {
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.summaryValueContainer}>
      <Divider />
      <View style={styles.summaryValueContentContainer}>
        <DurationText variant="bodyLarge" duration={props.duration} />
        <View style={styles.summaryValueDescriptionContainer}>
          <View>
            <Badge
              size={6}
              style={[
                { backgroundColor: props.color },
                styles.summaryValueBadgeView,
              ]}
            />
          </View>
          <Text variant="bodySmall">{props.name}</Text>
        </View>
      </View>
    </View>
  );
};

type RadialChartProps = {
  data: { duration: number; color: string }[];
} & ComponentNamedStyles<
  typeof defaultStyles
>['SleepAnalysisSummary']['radialChart'];

const RadialChart = (incomingProps: RadialChartProps) => {
  const { styles } = useStyles(defaultStyles);

  const props = { ...incomingProps, ...styles.radialChart };
  const { gapDeg = 1, size = 160, startAngle = 270 } = props;
  const { stroke = 7, radius = (size - 2 * stroke) / 2 } = props;
  const { defaultStroke, fill, data } = props;

  const { segments, duration } = useMemo(() => {
    const parts = data.filter((d) => d.duration > 0);

    return {
      segments: parts,
      duration: parts.length
        ? parts.reduce((acc, item) => acc + item.duration, 0)
        : undefined,
    };
  }, [data]);

  const renderArcs = () => {
    let currentAngle = startAngle; // Where to draw the circle from, defaults to top middle
    const angles: number[] = segments.map(
      (item) =>
        (item.duration / (duration || 1)) * (360 - segments.length * gapDeg),
    );

    return angles.map((angle, index) => {
      const endAngle = currentAngle + angle;
      const arcPath = describeArc({
        origin: size / 2,
        radius,
        startAngle: currentAngle,
        endAngle,
      });

      currentAngle = endAngle + gapDeg;

      return (
        <Path
          key={index}
          d={arcPath}
          fill={fill}
          stroke={data[index].color}
          strokeWidth={stroke}
        />
      );
    });
  };

  return (
    <View style={styles.summaryChartContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderArcs()}

        {/* Empty circle if there is no data */}
        {segments.length === 0 && (
          <Path
            d={describeArc({
              origin: size / 2,
              radius,
              startAngle: 0,
              endAngle: 360,
            })}
            fill={fill}
            stroke={defaultStroke}
            strokeWidth={stroke}
          />
        )}

        <ForeignObject key={`description-${duration}`}>
          <View
            style={[
              styles.summaryChartTextContainer,
              {
                width: size,
                height: size,
                paddingHorizontal: 2 * stroke,
              },
            ]}
          >
            <DurationText
              adjustsFontSizeToFit
              numberOfLines={1}
              variant="headlineMedium"
              duration={duration}
            />
            <Text adjustsFontSizeToFit numberOfLines={1} variant="bodySmall">
              {t('sleep-analysis-summary-total-sleep', 'Total Sleep')}
            </Text>
          </View>
        </ForeignObject>
      </Svg>
    </View>
  );
};

type ArcProps = {
  origin: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};
const describeArc = ({ origin, radius, startAngle, endAngle }: ArcProps) => {
  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const x1 = origin + radius * Math.cos(startRadians);
  const y1 = origin + radius * Math.sin(startRadians);

  const x2 = origin + radius * Math.cos(endRadians);
  const y2 = origin + radius * Math.sin(endRadians);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'; // Set large-arc-flag
  const sweepFlag = 1; // Always sweep (1) for a circular arc

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
};

const defaultStyles = createStyles('SleepAnalysisSummary', (theme) => ({
  radialChart: {
    fill: 'transparent',
    defaultStroke: theme.colors.border,
  } as Record<'gapDeg' | 'size' | 'stroke' | 'radius' | 'startAngle', number> &
    Record<'fill' | 'defaultStroke', ColorValue>,
  summaryChartTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryValuesContainer: { flexDirection: 'row', columnGap: 10 },
  summaryValueRowContainer: { flex: 1 },
  summaryChartContainer: { alignItems: 'center', width: '100%' },
  summaryValueContainer: {},
  summaryValueContentContainer: {
    paddingVertical: 6,
  },
  summaryValueDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  summaryValueBadgeView: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
