import React, { useState } from 'react';
import { t } from 'i18next';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { ScreenSurface } from '../components/ScreenSurface';
import { LineChart } from '../components/MyData/LineChart';
import { DatePicker } from '../components/TrackTile/TrackerDetails/DatePicker';
import {
  format,
  isAfter,
  startOfToday,
  endOfDay,
  addDays,
  addYears,
  addMonths,
  addWeeks,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { createStyles } from '../components';
import { useStyles, useTheme } from '../hooks';

type Period = {
  label: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  shiftByFn: (date: Date, amount: number) => Date;
  startOfPeriodFn: (date: Date | number) => Date;
};

const PERIODS: Period[] = [
  { label: 'DAY', shiftByFn: addDays, startOfPeriodFn: startOfDay },
  { label: 'WEEK', shiftByFn: addWeeks, startOfPeriodFn: startOfWeek },
  { label: 'MONTH', shiftByFn: addMonths, startOfPeriodFn: startOfMonth },
  { label: 'YEAR', shiftByFn: addYears, startOfPeriodFn: startOfYear },
];

export const MyDataScreen = () => {
  const theme = useTheme();
  const { data: config, isLoading: loadingAppConfig } = useAppConfig();
  const { styles } = useStyles(defaultStyles);
  const [period, setPeriod] = useState(PERIODS[1]);
  const [range, setRange] = useState(() => {
    const start = startOfWeek(startOfToday());
    const end = endOfDay(addDays(addWeeks(start, 1), -1));

    return {
      start,
      end,
    };
  });

  const handlePeriodChange = (newPeriod: Period) => {
    setRange((current) => ({
      start: newPeriod.startOfPeriodFn(current.start),
      end: endOfDay(
        addDays(
          newPeriod.shiftByFn(newPeriod.startOfPeriodFn(current.start), 1),
          -1,
        ),
      ),
    }));
    setPeriod(newPeriod);
  };

  if (loadingAppConfig) {
    return (
      <ActivityIndicatorView
        message={t('home-screen-loading-config', 'Loading app config')}
      />
    );
  }

  return (
    <ScreenSurface testID="my-data-screen">
      <View style={styles.container}>
        <ScrollView horizontal style={styles.periodScrollView}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.label}
              onPress={() => handlePeriodChange(p)}
              style={[
                styles.periodBubbleView,
                p.label === period.label && styles.periodBubbleSelectedView,
              ]}
            >
              <Text
                style={[
                  styles.periodBubbleText,
                  p.label === period.label && styles.periodBubbleSelectedText,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.datePickerContainer}>
          <DatePicker
            backAccessibilityLabel={t(
              'my-data.previous-periods-data',
              "Previous period's data",
            )}
            forwardAccessibilityLabel={t(
              'my-data.next-periods-data',
              "Next period's data",
            )}
            backValue={-1}
            forwardValue={1}
            dateText={
              period.label === 'DAY'
                ? t('my-data.date', {
                    defaultValue: '{{date}}',
                    date: format(range.start, 'MMMM dd, yyyy'),
                  })
                : period.label === 'YEAR'
                ? t('track-tile.date', {
                    defaultValue: '{{date}}',
                    date: format(range.start, 'yyyy'),
                  })
                : t('track-tile.date-range', {
                    defaultValue: '{{start}}-{{end}}',
                    start: format(range.start, 'MMMM dd'),
                    end: format(range.end, 'dd, yyyy'),
                  })
            }
            color={
              styles.datePickerNavigatorContainer?.backgroundColor?.toString() ??
              theme.colors.primary
            }
            onChange={(shiftByDays) =>
              setRange((current) => ({
                start: period.shiftByFn(current.start, shiftByDays),
                end: period.shiftByFn(current.end, shiftByDays),
              }))
            }
            iconDisabledCondition={isAfter(range.end, startOfToday())}
          />
        </View>

        {config?.homeTab?.myDataSettings?.components.map((component, index) => (
          <React.Fragment key={`${component.type}-${index}`}>
            {index > 0 && <Divider style={styles.divider} />}
            <LineChart
              {...component}
              dateRange={[range.start, range.end]}
              padding={Number(styles.container?.paddingHorizontal) * 2}
            />
          </React.Fragment>
        ))}
      </View>
    </ScreenSurface>
  );
};

const defaultStyles = createStyles('MyDataScreen', (theme) => ({
  container: {
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 20,
  },
  periodScrollView: { paddingVertical: 10 },
  periodBubbleView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    marginRight: 10,
  },
  periodBubbleSelectedView: {
    backgroundColor: theme.colors.secondary,
  },
  periodBubbleText: {
    paddingHorizontal: 15,
  },
  periodBubbleSelectedText: {
    color: theme.colors.onSecondary,
  },
  datePickerContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 10,
  },
  datePickerNavigatorContainer: {
    backgroundColor: theme.colors.primary,
  },
  divider: {
    width: '100%',
    backgroundColor: theme.colors.onSurface,
    marginBottom: 24,
    marginTop: 5,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
