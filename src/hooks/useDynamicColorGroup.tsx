import React from 'react';
import { generateColors } from '../components/BrandConfigProvider/theme/generateColors';

interface ColorGroup {
  color?: string;
  onColor?: string;
  colorContainer?: string;
  onColorContainer?: string;
  backdrop?: string;
}

export const useDynamicColorGroup = (color: string) => {
  const colorPalette = React.useMemo(() => generateColors(color), [color]);

  const colorGroup: ColorGroup = {
    color: colorPalette.primary,
    onColor: colorPalette.onPrimary,
    colorContainer: colorPalette.primaryContainer,
    onColorContainer: colorPalette.onPrimaryContainer,
    backdrop: colorPalette.backdrop,
  };

  return colorGroup;
};
