import { flatten, sortBy } from 'lodash';
import {
  TrackerValue,
  CodedRelationship,
  Code,
} from '../../services/TrackTileService';
import { isCodeEqual } from '../../util/is-code-equal';

export type CodedRelationshipNode = CodedRelationship & {
  parent?: CodedRelationshipNode;
};
export type CodeNode = Code & { parent?: Code };

const unpackLevels = (
  ontologies: CodedRelationshipNode[] = [],
  parent: CodedRelationshipNode,
  levels: CodedRelationshipNode[][] = [],
  level = 0,
): CodedRelationshipNode[][] => {
  ontologies.forEach((ontology) => {
    levels[level] = levels[level] ?? [];
    const mapped = { ...ontology, parent };
    levels[level].push(mapped);
    unpackLevels(ontology.specializedBy, mapped, levels, level + 1);
  });

  return levels;
};

const hasAncestorWithCode = (
  node?: CodedRelationshipNode,
  code?: Code,
): boolean =>
  !!node && (isCodeEqual(node, code) || hasAncestorWithCode(node.parent, code));

export const extractOntology = (
  trackerValue: Pick<TrackerValue, 'code'>,
  ontology: CodedRelationship[],
  tracker: Omit<Code, 'display'>,
) => {
  const selectedValues = trackerValue.code.coding.slice().reverse();
  const defaultTrackerValue =
    selectedValues.find((value) => isCodeEqual(value, tracker)) ??
    selectedValues[0] ??
    tracker;

  const ontologyWithoutGroups = flatten(ontology.map((o) => o.specializedBy));

  const rootCode: CodedRelationshipNode = {
    ...defaultTrackerValue,
    specializedBy: ontologyWithoutGroups,
  };

  const levels = unpackLevels(ontologyWithoutGroups, rootCode).reverse();

  const node = flatten(levels).find((n) =>
    trackerValue.code.coding.some((v) => isCodeEqual(v, n)),
  );

  const [leafs, subs] = levels;

  let leafNode = node;
  while (leafNode?.specializedBy?.length) {
    const parent = leafNode;
    leafNode = leafNode.specializedBy[0];
    leafNode.parent = parent;
  }

  const categories = node
    ? subs?.filter((s) => hasAncestorWithCode(leafNode, s.parent))
    : subs;

  const subCategories = leafs?.filter(
    (leaf) =>
      categories?.some((category) => isCodeEqual(leaf.parent, category)) ??
      true,
  );

  const baseCode = categories?.[0]?.parent ?? rootCode;

  const selectedCategory = categories?.find(
    (c) => isCodeEqual(node, c) || isCodeEqual(node?.parent, c),
  );
  const selectedSubCategory = subCategories?.find((c) => isCodeEqual(node, c));

  return {
    selectedSubCategory,
    selectedCategory,
    baseCode,
    categories: categories && sortBy(categories, 'display'),
    subCategories: subCategories && sortBy(subCategories, 'display'),
  };
};

export type CategoryTypes = Omit<
  ReturnType<typeof extractOntology>,
  'selectedCategory' | 'selectedSubCategory'
>;
