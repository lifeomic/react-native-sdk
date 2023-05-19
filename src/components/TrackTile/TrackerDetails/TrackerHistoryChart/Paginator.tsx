import { isToday } from 'date-fns';
import React, { FC } from 'react';
import { StyleSheet, View, TouchableOpacity, I18nManager } from 'react-native';
import { useFlattenedStyles } from '../../hooks/useFlattenedStyles';
import { StylesProp, useStyleOverrides, Text } from '../../styles';
import { t } from '../../../../../lib/i18n';
import { tID } from '../../common/testID';
import { dateFormatters } from '../../formatters';
import { useIcons } from '../../../BrandConfigProvider';

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
  const { ChevronLeft, ChevronRight } = useIcons();
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
        accessibilityLabel={t(
          'track-tile.previous-weeks-data',
          "Previous week's data",
        )}
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
        testID={tID('history-chart-active-track-tile.date-range')}
        accessible={false}
        style={styles.trackerHistoryChartPaginatorTitle}
      >
        {t('track-tile.date-range', {
          defaultValue: '{{start}} - {{end}}',
          start: shortMonthNumericDayWithYear(range.start),
          end: shortMonthNumericDayWithYear(range.end),
          formatParams: {
            start: shortMonthNumericDayWithYear,
            end: shortMonthNumericDayWithYear,
          },
        })}
      </Text>
      <TouchableOpacity
        testID={tID('history-chart-view-next-week')}
        accessibilityLabel={t('track-tile.next-weeks-data', "Next week's data")}
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
