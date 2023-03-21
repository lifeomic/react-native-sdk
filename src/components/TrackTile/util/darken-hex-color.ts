export const darkenHexColor = (color: string, darkenBy: number): string => {
  if (!/#[0-9A-F]{6}/i.exec(color)) return color;

  return `#${color.replace(/^#/, '').replace(/../g, (color) =>
    Math.min(255, Math.max(0, parseInt(color, 16) + darkenBy))
      .toString(16)
      .padStart(2, '0')
  )}`;
};
