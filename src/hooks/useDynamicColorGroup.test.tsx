import { renderHook } from '@testing-library/react-native';
import { useDynamicColorGroup } from './useDynamicColorGroup';

test('returns theme', () => {
  const {
    result: { current: colorGroup },
  } = renderHook(() => useDynamicColorGroup('#808080'));

  expect(colorGroup).toEqual({
    color: 'rgb(0, 104, 116)',
    onColor: 'rgb(255, 255, 255)',
    colorContainer: 'rgb(151, 240, 255)',
    onColorContainer: 'rgb(0, 31, 36)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  });
});
