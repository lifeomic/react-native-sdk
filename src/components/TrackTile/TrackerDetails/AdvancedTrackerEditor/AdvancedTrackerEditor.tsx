import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import i18n from '@i18n';
import { Trans } from 'react-i18next';
import {
  StylesProp,
  NamedStyles,
  useFontOverrides,
  useStyleOverrides
} from '../../styles';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  useTrackTileService
} from '../../services/TrackTileService';
import { CodingSubCategoryRow } from './CodingSubCategoryRow';
import { CodingCategoryPicker } from './CodingCategoryPicker';
import {
  convertToPreferredUnit,
  convertToStoreUnit,
  getPreferredUnitType
} from '../../util/convert-value';
import { isCodeEqual } from '../../util/is-code-equal';
import { CodeNode, CategoryTypes, extractOntology } from './extract-ontology';
import { tID } from '../../common/testID';
import { ValueEditor } from './ValueEditor';
import { EventTypeHandler, notifier } from '../../services/EmitterService';
import { toFhirResource } from '../to-fhir-resource';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}

export type AdvancedTrackerEditorProps = {
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  trackerValue: TrackerValue;
  children?: React.ReactNode;
};

export const AdvancedTrackerEditor = (props: AdvancedTrackerEditorProps) => {
  const { tracker, trackerValue } = props;
  const { valuesContext } = props;
  const styles = useStyleOverrides(defaultStyles);
  const fontWeights = useFontOverrides();
  const svc = useTrackTileService();
  const [categoryTypes, setCategoryTypes] = useState<CategoryTypes>();
  const [category, setSelectedCategory] = useState<CodeNode>();
  const [subCategory, setSelectedSubCategory] = useState<CodeNode>();
  const [value, setValue] = useState(trackerValue.value);
  const {
    stepAmount = 1,
    display,
    displayOne = display
  } = getPreferredUnitType(tracker);
  const stepAmountInStoreUnits = convertToStoreUnit(stepAmount, tracker);
  const metricId = tracker.metricId ?? tracker.id;

  useEffect(() => {
    const handler: EventTypeHandler<'saveEditTrackerValue'> = async (
      resolve,
      reject
    ) => {
      try {
        const newCode = subCategory || category || trackerValue.code.coding[0];

        // If there are no changes exit early
        if (
          isCodeEqual(trackerValue.code.coding[0], newCode) &&
          value === trackerValue.value
        ) {
          return resolve?.(trackerValue);
        }

        if (value > 0) {
          const res = await svc.upsertTrackerResource(
            valuesContext,
            toFhirResource(
              tracker.resourceType,
              {
                ...svc,
                ...trackerValue,
                createDate: trackerValue?.createdDate || new Date(),
                tracker,
                // This gets converted by toFhirResource to the store value
                // and expects the value to come in as the tracker unit
                value: convertToPreferredUnit(value, tracker)
              },
              newCode
            )
          );
          notifier.emit('valuesChanged', [
            { valuesContext, metricId, tracker: res }
          ]);
          resolve?.(res);
        } else {
          const removed = await svc.deleteTrackerResource(
            valuesContext,
            tracker.resourceType,
            trackerValue.id
          );

          if (removed) {
            notifier.emit('valuesChanged', [
              { valuesContext, metricId, tracker: trackerValue, drop: true }
            ]);
            return resolve?.(undefined);
          }

          reject?.(new Error('Could not delete the value'));
        }
      } catch (e) {
        reject?.(e);
      }
    };

    notifier.addListener('saveEditTrackerValue', handler);

    return () => {
      notifier.removeListener('saveEditTrackerValue', handler);
    };
  }, [
    valuesContext,
    metricId,
    svc,
    category,
    subCategory,
    value,
    trackerValue,
    tracker
  ]);

  useEffect(() => {
    const fetchOntology = async () => {
      const ontology = await svc.fetchOntology(tracker.code);

      const result = extractOntology(trackerValue, ontology, tracker);

      setCategoryTypes(result);
      setSelectedCategory(result.selectedCategory);
      setSelectedSubCategory(result.selectedSubCategory);
    };

    fetchOntology();
  }, [trackerValue.code, svc.fetchOntology, tracker]);

  useEffect(() => {
    setValue(trackerValue.value);
  }, [trackerValue.value]);

  const toggleCategory = useCallback(
    (code?: CodeNode) => () => {
      setSelectedCategory((current) => {
        setSelectedSubCategory(undefined);

        return isCodeEqual(current, code) && !subCategory ? undefined : code;
      });
    },
    [subCategory]
  );

  const toggleElement = useCallback(
    (code: CodeNode) => () => {
      setSelectedCategory(code.parent);
      setSelectedSubCategory((current) => {
        return isCodeEqual(current, code) ? undefined : code;
      });
    },
    []
  );

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <ValueEditor
            color={tracker.color}
            resourceType={tracker.resourceType}
            observationUnit={displayOne
              .replace('{{count}}', '')
              .replace(/\s+/g, ' ')
              .trim()}
            onValueChange={setValue}
            value={value}
            stepAmount={stepAmountInStoreUnits}
            style={[
              styles.advancedEditorSection,
              styles.advancedEditorHorizontalLayout
            ]}
          />

          {categoryTypes?.categories && (
            <View style={styles.advancedEditorSection}>
              <CodingCategoryPicker
                categoryHeader={i18n.t('editor-selection-header', {
                  defaultValue: 'Select {{code}}',
                  code: categoryTypes.baseCode.display
                })}
                codes={categoryTypes.categories}
                color={tracker.color}
                selectedCode={category}
                onCodePressed={toggleCategory}
              />
            </View>
          )}

          {categoryTypes?.subCategories && (
            <View style={styles.advancedEditorSelectedContainer}>
              <Trans
                i18n={i18n}
                parent={Text}
                i18nKey="editor-selected-category-header"
                defaults="Selected: <bold>{{categoryName}}</bold>"
                values={{
                  categoryName:
                    subCategory?.display ||
                    category?.display ||
                    categoryTypes.baseCode.display
                }}
                components={{
                  bold: ((categoryName?: string) => (
                    <Text style={fontWeights.bold}>{categoryName}</Text>
                  ))()
                }}
              />
            </View>
          )}
        </>
      }
      data={categoryTypes?.subCategories}
      renderItem={({ item: code }) =>
        !category || isCodeEqual(category, code.parent) ? (
          <CodingSubCategoryRow
            testID={
              subCategory === code ? tID('selected-sub-category') : undefined
            }
            code={code}
            color={tracker.color}
            selected={subCategory === code}
            onPress={toggleElement(code)}
          />
        ) : null
      }
    />
  );
};

const defaultStyles = StyleSheet.create({
  advancedEditorSection: {
    padding: 35,
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1
  },
  advancedEditorHorizontalLayout: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  advancedEditorSelectedContainer: {
    paddingHorizontal: 35,
    paddingVertical: 8,
    backgroundColor: '#F2F2F2',
    borderBottomColor: 'rgba(36, 37, 54, 0.15)',
    borderBottomWidth: 1
  }
});
