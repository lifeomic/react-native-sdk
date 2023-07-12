import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SocialShareExporter } from './SocialShareExporter';
import Share from 'react-native-share';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';
import { Renderer } from './renderers/types';
import { PointBreakdownProps } from './renderers/point-breakdown';

jest.mock('../../hooks/useDeveloperConfig', () => ({
  useDeveloperConfig: jest.fn(),
}));

const mockUseDeveloperConfig = useDeveloperConfig as any as jest.Mock;

describe('SocialShareExporter', () => {
  it('should call share when renderer onLoad is called', async () => {
    let mockOnLoad: Function;
    mockUseDeveloperConfig.mockReturnValue({
      sharingRenderers: {
        pointBreakdown: ({ onLoad }: Renderer) => {
          mockOnLoad = onLoad;
          return null;
        },
      },
    });

    render(
      <SocialShareExporter
        type="pointBreakdown"
        metadata={{
          dataUri: '',
          dateRange: [new Date(), new Date()],
          selectedPoints: [],
          title: 'title',
        }}
      />,
    );

    expect(Share.open).not.toHaveBeenCalled();

    await act(() => mockOnLoad());

    expect(Share.open).toHaveBeenCalledWith({
      failOnCancel: false,
      type: 'image/jpeg',
      url: 'mockImageData',
    });
  });

  it('should not call share again if rerendered with the same metadata', async () => {
    let mockOnLoad: Function;
    mockUseDeveloperConfig.mockReturnValue({
      sharingRenderers: {
        pointBreakdown: ({ onLoad }: Renderer) => {
          mockOnLoad = onLoad;
          return null;
        },
      },
    });

    const metadata: Omit<PointBreakdownProps, 'onLoad'> = {
      dataUri: '',
      dateRange: [new Date(), new Date()],
      selectedPoints: [],
      title: 'title',
    };

    const { rerender } = render(
      <SocialShareExporter type="pointBreakdown" metadata={metadata} />,
    );

    expect(Share.open).not.toHaveBeenCalled();

    await act(() => mockOnLoad());

    expect(Share.open).toHaveBeenCalledTimes(1);

    rerender(<SocialShareExporter type="pointBreakdown" metadata={metadata} />);

    await act(() => mockOnLoad());

    expect(Share.open).toHaveBeenCalledTimes(1);
  });
});
