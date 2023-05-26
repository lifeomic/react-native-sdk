import { isToday } from 'date-fns';
import React, { FC } from 'react';
import { View, TouchableOpacity, I18nManager } from 'react-native';
import { Text } from '../../styles';
import { t } from '../../../../../lib/i18n';
import { tID } from '../../common/testID';
import { dateFormatters } from '../../formatters';
import { createStyles, useIcons } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

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
  const { styles } = useStyles(defaultStyles);

  const chevrons = [ChevronLeft, ChevronRight];
  const [LeftChevron, RightChevron] = I18nManager.isRTL
    ? chevrons.reverse()
    : chevrons;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID={tID('history-chart-view-previous-week')}
        style={styles.stepperButton}
        accessibilityLabel={t(
          'track-tile.previous-weeks-data',
          "Previous week's data",
        )}
        accessibilityRole="button"
        onPress={() => onChangeRange(-7)}
        hitSlop={hitSlop}
      >
        <LeftChevron color={color || styles.activeButtonColorText?.color} />
      </TouchableOpacity>
      <Text
        testID={tID('history-chart-active-track-tile.date-range')}
        accessible={false}
        style={styles.titleText}
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
        style={styles.stepperButton}
        disabled={isToday(range.end)}
        onPress={() => onChangeRange(7)}
        hitSlop={hitSlop}
      >
        <RightChevron
          color={
            isToday(range.end)
              ? styles.disabledButtonColorText?.color
              : color || styles.activeButtonColorText?.color
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = createStyles('TrackTileChartPaginator', () => ({
  container: {
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleText: {
    flex: 1,
    textAlign: 'center',
  },
  stepperButton: {
    height: 13,
  },
  activeButtonColorText: {
    color: '#02BFF1',
  },
  disabledButtonColorText: {
    color: '#BDBDBD',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default Paginator;
