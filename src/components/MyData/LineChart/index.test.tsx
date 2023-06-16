import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { LineChart } from './index';
import { useFhirClient } from '../../../hooks';

jest.mock('../../../hooks/useFhirClient', () => ({
  useFhirClient: jest.fn(),
}));

jest.mock('victory-native/src/components/victory-primitives/tspan', () => Text);

const mockUseFhirClient = useFhirClient as any as jest.Mock;
const useSearchResourcesQuery = jest.fn();

describe('LineChart', () => {
  beforeEach(() => {
    useSearchResourcesQuery.mockReset();

    mockUseFhirClient.mockReturnValue({
      useSearchResourcesQuery,
    });
  });

  it('should render the chart', async () => {
    useSearchResourcesQuery.mockReturnValue({
      data: {
        entry: [
          {
            resourceType: 'Observation',
            effectiveDateTime: new Date(0).toISOString(),
            valueQuantity: {
              value: 5,
            },
          } as fhir3.Observation,
        ],
      },
    });

    const { findByText, findAllByText } = render(
      <LineChart
        dateRange={[new Date(0), new Date(0)]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findByText('Test Title')).toBeDefined();
    expect(await findAllByText('Trace1Label')).toHaveLength(2); // Legend & Axis
    expect(await findByText('Dec 30')).toBeDefined();
    expect(await findByText('31')).toBeDefined();
    expect(await findByText('01')).toBeDefined();
  });

  it('should render the chart with second trace when supplied', async () => {
    useSearchResourcesQuery.mockReturnValue({
      data: {
        entry: [
          {
            resourceType: 'Observation',
            effectiveDateTime: new Date(0).toISOString(),
            valueQuantity: {
              value: 5,
            },
          } as fhir3.Observation,
          {
            resourceType: 'Observation',
            effectiveDateTime: new Date(0).toISOString(),
            valueQuantity: {
              value: 6,
            },
          } as fhir3.Observation,
        ],
      },
    });

    const { findAllByText } = render(
      <LineChart
        dateRange={[new Date(0), new Date(0)]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
        trace2={{
          type: 'Observation',
          label: 'Trace2Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findAllByText('Trace2Label')).toHaveLength(2); // Legend & Axis
  });

  it('should render the chart without trace if data is empty', async () => {
    useSearchResourcesQuery.mockReturnValue({
      data: {}, // no data
    });

    const { findByText } = render(
      <LineChart
        dateRange={[new Date(0), new Date(0)]}
        title="Test Title"
        trace1={{
          type: 'Observation',
          label: 'Trace1Label',
          code: {
            code: 'c',
            system: 's',
          },
        }}
      />,
    );

    expect(await findByText('Trace1Label')).toBeDefined(); // Legend Only
  });
});
