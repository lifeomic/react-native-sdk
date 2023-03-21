import {
  TrackerValue as BaseTrackerValue,
  Code as BaseCode,
  CodedRelationship
} from '../../services/TrackTileService';
import { extractOntology } from './extract-ontology';

type TrackerValue = Pick<BaseTrackerValue, 'code'>;
type Code = Omit<BaseCode, 'display' | 'id'>;

const trackerCode: Code = {
  code: '1',
  system: 'sys'
};

const trackerValue = (...coding: Code[]): TrackerValue => ({
  code: {
    coding: coding as BaseCode[]
  }
});

const ontology = (
  code: string,
  subCodes?: () => CodedRelationship[]
): CodedRelationship => ({
  code,
  display: code,
  specializedBy: subCodes?.() as CodedRelationship[],
  system: `${code}|system`
});

describe('Extract Ontology Levles', () => {
  it('should handle an empty list of ontologies', () => {
    const res = extractOntology(trackerValue(), [], trackerCode);

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining(trackerCode),
      categories: undefined,
      subCategories: undefined
    });
  });

  it('should use the last coding in the array as the baseCode if no matching codes are found', () => {
    const res = extractOntology(
      trackerValue(
        {
          code: '1',
          system: '2'
        },
        {
          code: '3',
          system: '4'
        }
      ),
      [],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining({
        code: '3',
        system: '4'
      }),
      categories: undefined,
      subCategories: undefined
    });
  });

  it('should use a matching tracker coding as the baseCode if no matching codes are found', () => {
    const res = extractOntology(
      trackerValue(
        {
          code: '1',
          system: '2'
        },
        {
          code: 'match',
          system: 'match-system'
        },
        {
          code: '3',
          system: '4'
        }
      ),
      [],
      {
        code: 'match',
        system: 'match-system'
      }
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining({
        code: 'match',
        system: 'match-system'
      }),
      categories: undefined,
      subCategories: undefined
    });
  });

  it('should extract (sub)Categories from ontologies', () => {
    const res = extractOntology(
      trackerValue(),
      [
        ontology('group', () => [
          ontology('cat-1', () => [ontology('sub-cat-1')]),
          ontology('cat-2', () => [
            ontology('sub-cat-2'),
            ontology('sub-cat-3')
          ]),
          ontology('cat-3')
        ])
      ],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining(trackerCode),
      categories: [
        expect.objectContaining({ code: 'cat-1' }),
        expect.objectContaining({ code: 'cat-2' }),
        expect.objectContaining({ code: 'cat-3' })
      ],
      subCategories: [
        expect.objectContaining({ code: 'sub-cat-1' }),
        expect.objectContaining({ code: 'sub-cat-2' }),
        expect.objectContaining({ code: 'sub-cat-3' })
      ]
    });
  });

  it('should extract (sub)Categories with parent links from ontologies', () => {
    const res = extractOntology(
      trackerValue(),
      [
        ontology('group', () => [
          ontology('cat-1', () => [ontology('sub-cat-1')]),
          ontology('cat-2', () => [
            ontology('sub-cat-2'),
            ontology('sub-cat-3')
          ]),
          ontology('cat-3')
        ])
      ],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining(trackerCode),
      categories: [
        expect.objectContaining({
          code: 'cat-1',
          parent: expect.objectContaining(trackerCode)
        }),
        expect.objectContaining({
          code: 'cat-2',
          parent: expect.objectContaining(trackerCode)
        }),
        expect.objectContaining({
          code: 'cat-3',
          parent: expect.objectContaining(trackerCode)
        })
      ],
      subCategories: [
        expect.objectContaining({
          code: 'sub-cat-1',
          parent: expect.objectContaining({ code: 'cat-1' })
        }),
        expect.objectContaining({
          code: 'sub-cat-2',
          parent: expect.objectContaining({ code: 'cat-2' })
        }),
        expect.objectContaining({
          code: 'sub-cat-3',
          parent: expect.objectContaining({ code: 'cat-2' })
        })
      ]
    });
  });

  it('should extract Categories into subCategories if there are no specializations', () => {
    const res = extractOntology(
      trackerValue(),
      [
        ontology('group', () => [
          ontology('cat-1'),
          ontology('cat-2'),
          ontology('cat-3')
        ])
      ],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining(trackerCode),
      categories: undefined,
      subCategories: [
        expect.objectContaining({ code: 'cat-1' }),
        expect.objectContaining({ code: 'cat-2' }),
        expect.objectContaining({ code: 'cat-3' })
      ]
    });
  });

  it('should extract the deepest two layers (leafs and parents of leafs) and filter by parent selection', () => {
    const res = extractOntology(
      trackerValue({
        code: 'b-1',
        system: 'b-1|system'
      }),
      [
        ontology('group', () => [
          ontology('a-1', () => [
            ontology('b-1', () => [
              ontology('c-1', () => [ontology('d-1'), ontology('d-2')]),
              ontology('c-2', () => [ontology('d-3'), ontology('d-4')]),
              ontology('c-3')
            ])
          ]),
          ontology('a-2', () => [ontology('b-2')]),
          ontology('a-3', () => [ontology('b-3')])
        ])
      ],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: undefined,
      selectedSubCategory: undefined,
      baseCode: expect.objectContaining({
        code: 'b-1',
        system: 'b-1|system'
      }),
      categories: [
        expect.objectContaining({ code: 'c-1' }),
        expect.objectContaining({ code: 'c-2' }),
        expect.objectContaining({ code: 'c-3' })
      ],
      subCategories: [
        expect.objectContaining({ code: 'd-1' }),
        expect.objectContaining({ code: 'd-2' }),
        expect.objectContaining({ code: 'd-3' }),
        expect.objectContaining({ code: 'd-4' })
      ]
    });
  });

  it('should return the selected category and subCategory when chosen', () => {
    const res = extractOntology(
      trackerValue(
        {
          code: 'c-3',
          system: 'c-3|system'
        },
        {
          code: 'b-3',
          system: 'b-3|system'
        },
        {
          code: 'a-1',
          system: 'a-1|system'
        }
      ),
      [
        ontology('group', () => [
          ontology('a-1', () => [
            ontology('b-1', () => [ontology('c-1')]),
            ontology('b-2', () => [ontology('c-2')]),
            ontology('b-3', () => [ontology('c-3')])
          ])
        ])
      ],
      trackerCode
    );

    expect(res).toEqual({
      selectedCategory: expect.objectContaining({
        code: 'b-3',
        system: 'b-3|system'
      }),
      selectedSubCategory: expect.objectContaining({
        code: 'c-3',
        system: 'c-3|system'
      }),
      baseCode: expect.objectContaining({
        code: 'a-1',
        system: 'a-1|system'
      }),
      categories: [
        expect.objectContaining({ code: 'b-1' }),
        expect.objectContaining({ code: 'b-2' }),
        expect.objectContaining({ code: 'b-3' })
      ],
      subCategories: [
        expect.objectContaining({ code: 'c-1' }),
        expect.objectContaining({ code: 'c-2' }),
        expect.objectContaining({ code: 'c-3' })
      ]
    });
  });
});
