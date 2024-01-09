import { useCallback } from 'react';
import { CodeableConcept } from 'fhir/r3';
import { useStyles } from '../../../hooks';
import { createStyles, ComponentStyles } from '../../BrandConfigProvider';
import { t } from 'i18next';

export const useSleepDisplay = (
  stageColors?: ComponentStyles['SleepAnalysisDisplay']['stageColors'],
) => {
  const styles = useStyles(defaultStyles, { stageColors });

  return useCallback(
    (coding?: CodeableConcept | SleepType) => {
      const codeType =
        typeof coding === 'string' ? coding : codeToType(coding ?? {});
      const num = {
        deep: 1,
        light: 2,
        rem: 3,
        awake: 4,
        default: 0,
      }[codeType];

      return {
        codeType,
        num,
        name: valToName(num),
        color: styles.styles.stageColors?.[codeType] ?? 'transparent',
      };
    },
    [styles.styles.stageColors],
  );
};

export const valToName = (value: number) =>
  ({
    4: t('sleep-analysis-type-awake', 'Awake'),
    3: t('sleep-analysis-type-rem', 'REM'),
    2: t('sleep-analysis-type-light', 'Light'),
    1: t('sleep-analysis-type-deep', 'Deep'),
  }[value] ?? '');

export type SleepType = ReturnType<typeof codeToType>;

const codeToType = (coding: CodeableConcept) => {
  for (const code of coding.coding ?? []) {
    if (code.system === 'http://loinc.org' && code.code === '93830-8') {
      return 'light' as const;
    } else if (code.system === 'http://loinc.org' && code.code === '93831-6') {
      return 'deep' as const;
    } else if (code.system === 'http://loinc.org' && code.code === '93829-0') {
      return 'rem' as const;
    } else if (code.system === 'http://loinc.org' && code.code === '93828-2') {
      return 'awake' as const;
    }
  }

  return 'default' as const;
};

const defaultStyles = createStyles('SleepAnalysisDisplay', () => ({
  stageColors: {
    awake: 'hotpink',
    deep: 'dodgerblue',
    light: 'deepskyblue',
    rem: 'deeppink',
    default: 'transparent',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
