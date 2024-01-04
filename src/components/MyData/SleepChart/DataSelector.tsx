import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NativeTouchEvent, View } from 'react-native';
import { useCommonChartProps } from '../useCommonChartProps';
import {
  G,
  Rect,
  Svg,
  Text,
  Circle,
  RectProps,
  TextProps,
} from 'react-native-svg';
import { differenceInMilliseconds } from 'date-fns';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

export type SleepDataToolTipPreparer = (x: number) =>
  | undefined
  | {
      header: string;
      title: string;
      subtitle: string;
      color: string;
      x?: number;
      y?: number;
      hideTooltip?: boolean;
    };

type Props = {
  selectionDelayMs?: number;
  prepareTooltipData: SleepDataToolTipPreparer;
  onBlockScrollChange: (shouldBlock: boolean) => void;
};

export type Selection = {
  date: Date;
};

const tooltipOffset = 10;
const tooltipWidth = 115;

export const DataSelector = (props: Props) => {
  const { selectionDelayMs = 500 } = props;
  const { onBlockScrollChange, prepareTooltipData } = props;
  const common = useCommonChartProps();
  const [touchStarted, setTouchStarted] = useState<Date>();
  const [pendingSelection, setPendingSelection] = useState<NativeTouchEvent>();
  const [selection, setSelection] = useState<NativeTouchEvent>();
  const { styles } = useStyles(defaultStyles);

  useEffect(() => {
    let id: number;
    if (pendingSelection) {
      id = setTimeout(() => {
        onBlockScrollChange(true);
        setSelection(pendingSelection);
      }, selectionDelayMs) as any as number;
    }

    return () => clearTimeout(id);
  }, [pendingSelection, onBlockScrollChange, selectionDelayMs]);

  const clearSelection = useCallback(() => {
    onBlockScrollChange(false);
    setSelection(undefined);
    setPendingSelection(undefined);
  }, [onBlockScrollChange]);

  const tooltip = useMemo(() => {
    if (!selection) {
      return;
    }
    const minX = common.padding.left;
    const maxX = common.plotAreaWidth;

    const tooltipData = {
      x: selection.locationX,
      y: selection.locationY,
      ...prepareTooltipData(Math.min(Math.max(selection.locationX, 0), maxX)),
    };

    const x = minX + Math.min(Math.max(tooltipData.x, 0), maxX);

    return {
      ...tooltipData,
      x,
      y: common.padding.top,
      height: common.height - common.padding.bottom - common.padding.top,
      tooltipX: Math.min(
        Math.max(x - tooltipOffset, 0),
        maxX - tooltipWidth / 2,
      ),
      displayTooltip: !!tooltipData && !tooltipData.hideTooltip,
    };
  }, [selection, prepareTooltipData, common]);

  return (
    <>
      {tooltip && (
        <Svg
          width={common.width}
          height={common.height}
          style={styles.selectionContainer}
        >
          <G y={tooltip.y} x={tooltip.x}>
            <Rect
              x={-Number(styles.selectionLine?.width ?? 0) / 2}
              height={tooltip.height}
              {...styles.selectionLine}
            />
          </G>
          {tooltip.displayTooltip && (
            <G x={tooltip.tooltipX} y={tooltip.y}>
              <Rect
                width={tooltipWidth}
                height={62}
                rx={6}
                {...styles.tooltip}
              />
              <Text x={8} y={17} {...styles.tooltipHeader}>
                {tooltip.header}
              </Text>
              <G y={37} x={8}>
                <Circle x={5} y={-5} r={5} fill={tooltip.color} />
                <Text {...styles.tooltipTitle} x={16} fontSize={16}>
                  {tooltip.title}
                </Text>
                <Text {...styles.tooltipSubtitle} x={16} y={16}>
                  {tooltip.subtitle}
                </Text>
              </G>
            </G>
          )}
        </Svg>
      )}

      <View
        testID="sleep-chart-data-selector"
        onStartShouldSetResponder={(event) => {
          setTouchStarted(new Date(event.nativeEvent.timestamp));
          setPendingSelection(event.nativeEvent);
          return false;
        }}
        onMoveShouldSetResponder={(e) => {
          if (
            !touchStarted ||
            differenceInMilliseconds(
              new Date(e.nativeEvent.timestamp),
              touchStarted,
            ) < selectionDelayMs
          ) {
            clearSelection();
            return false;
          }

          return !!e.nativeEvent.touches.length;
        }}
        onResponderGrant={() => onBlockScrollChange(true)}
        onResponderMove={(event) => setSelection(event.nativeEvent)}
        onResponderRelease={clearSelection}
        onTouchEnd={clearSelection}
        style={{
          position: 'absolute',
          top: common.padding.top / 2,
          bottom: common.padding.bottom / 2,
          left: common.padding.left,
          width: common.plotAreaWidth,
        }}
      />
    </>
  );
};

const defaultStyles = createStyles('SleepAnalysisTooltip', (theme) => ({
  selectionContainer: {
    position: 'absolute',
    bottom: 0,
  },
  selectionLine: {
    width: 2,
    fill: theme.colors.scrim,
  } as RectProps,
  tooltip: {
    fill: theme.colors.onPrimaryContainer,
    opacity: 1,
  } as RectProps,
  tooltipHeader: {
    fill: theme.colors.primaryContainer,
  } as TextProps,
  tooltipTitle: {
    fill: 'white',
  } as TextProps,
  tooltipSubtitle: {
    fill: 'white',
  } as TextProps,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
