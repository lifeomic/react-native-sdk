import { isToday } from 'date-fns';
import React, { FC } from 'react';
import { StyleSheet, View, TouchableOpacity, I18nManager } from 'react-native';
import { useFlattenedStyles } from '../../hooks/useFlattenedStyles';
import { StylesProp, useStyleOverrides, Text } from '../../styles';
import i18n from '@i18n';
import { tID } from '../../common/testID';
import { dateFormatters } from '../../formatters';
import { ChevronLeft, ChevronRight } from '@lifeomic/chromicons-native';

type PaginatorProps = {
  color?: string;
  range: {
    start: Date;
    end: Date;
  };
  onChangeRange: (shiftByDays: number) => void;
};

const hitSlop = {
  top: 15,
  left: 15,
  bottom: 15,
  right: 15,
};

const { shortMonthNumericDayWithYear } = dateFormatters;

const Paginator: FC<PaginatorProps> = (props) => {
  const { range, onChangeRange, color } = props;
  const styles = useStyleOverrides(defaultStyles);
  const flatStyles = useFlattenedStyles(styles, [
    'trackerHistoryChartPaginatorActiveButtonColor',
    'trackerHistoryChartPaginatorDisabledButtonColor',
  ]);

  const chevrons = [ChevronLeft, ChevronRight];
  const [LeftChevron, RightChevron] = I18nManager.isRTL
    ? chevrons.reverse()
    : chevrons;

  return (
    <View style={styles.trackerHistoryChartPaginatorContainer}>
      <TouchableOpacity
        testID={tID('history-chart-view-previous-week')}
        style={styles.trackerHistoryChartPaginatorStepperButton}
        accessibilityLabel={i18n.t('53ce64deea48bc8554d76f9d22dbbca5', {
          defaultValue: "Previous week's data",
          ns: 'track-tile-ui',
        })}
        accessibilityRole="button"
        onPress={() => onChangeRange(-7)}
        hitSlop={hitSlop}
      >
        <LeftChevron
          color={
            color ||
            flatStyles.trackerHistoryChartPaginatorActiveButtonColor.color
          }
        />
      </TouchableOpacity>
      <Text
        testID={tID('history-chart-active-date-range')}
        accessible={false}
        style={styles.trackerHistoryChartPaginatorTitle}
      >
        {i18n.t('date-range', {
          defaultValue: '{{start}} - {{end}}',
          start: shortMonthNumericDayWithYear(range.start),
          end: shortMonthNumericDayWithYear(range.end),
          ns: 'track-tile-ui',
          formatParams: {
            start: shortMonthNumericDayWithYear,
            end: shortMonthNumericDayWithYear,
          },
        })}
      </Text>
      <TouchableOpacity
        testID={tID('history-chart-view-next-week')}
        accessibilityLabel={i18n.t('8c1ecfad31db029ed474399706684492', {
          defaultValue: "Next week's data",
          ns: 'track-tile-ui',
        })}
        accessibilityRole="button"
        style={styles.trackerHistoryChartPaginatorStepperButton}
        disabled={isToday(range.end)}
        onPress={() => onChangeRange(7)}
        hitSlop={hitSlop}
      >
        <RightChevron
          color={
            isToday(range.end)
              ? flatStyles.trackerHistoryChartPaginatorDisabledButtonColor.color
              : color ||
                flatStyles.trackerHistoryChartPaginatorActiveButtonColor.color
          }
        />
      </TouchableOpacity>
    </View>
  );
};

declare module '../TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackerHistoryChartPaginatorContainer: {
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
  trackerHistoryChartPaginatorTitle: {
    flex: 1,
    textAlign: 'center',
  },
  trackerHistoryChartPaginatorStepperButton: {
    height: 13,
  },
  trackerHistoryChartPaginatorActiveButtonColor: {
    color: '#02BFF1',
  },
  trackerHistoryChartPaginatorDisabledButtonColor: {
    color: '#BDBDBD',
  },
});

export default Paginator;