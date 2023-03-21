export const coerceToNonnegativeValue = (num: string, defaultNum: number) => {
  const targetNum = Number(num.replace(/[,\s]/g, ''));

  if (targetNum < 0) return 0;
  if (isNaN(targetNum) || !isFinite(targetNum)) return defaultNum;

  return Math.round(targetNum);
};
