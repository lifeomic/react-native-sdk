import { render } from '@testing-library/react-native';
import { useIcons } from '../../BrandConfigProvider';
import Indicator from './indicator';
import React from 'react';

jest.mock('../../BrandConfigProvider', () => ({
  useIcons: jest.fn(() => ({})),
}));

const mockUseIcons = useIcons as any as jest.Mock;
const Helix = jest.fn();

const stubIcons = (icons: any) => {
  Helix.mockReset();
  const toMock = { Helix, ...icons };
  mockUseIcons.mockReturnValue(toMock);
};

describe('Indicator', () => {
  it('should select the correct indicator based on name', () => {
    const test = jest.fn();
    const foo = jest.fn();
    stubIcons({ test, foo });

    render(<Indicator name="test" fallbackName="foo" />);

    expect(test).toHaveBeenCalled();
    expect(foo).not.toHaveBeenCalled(); // Not called because test exists
    expect(Helix).not.toHaveBeenCalled(); // No default fallback
  });

  it('should use the custom fallback if none exists', () => {
    const foo = jest.fn();
    stubIcons({ foo });

    render(<Indicator name="test" fallbackName="foo" />);

    expect(foo).toHaveBeenCalled();
    expect(Helix).not.toHaveBeenCalled(); // No default fallback
  });

  it('should fall back to helix if no icons are found', () => {
    stubIcons({});

    render(<Indicator name="notFound1" />);

    expect(Helix).toHaveBeenCalled();
  });

  it('should select chromicon by kebab case name', () => {
    const ActivityFolder = jest.fn();
    stubIcons({ ActivityFolder });

    render(<Indicator name="activity-folder" />);

    expect(ActivityFolder).toHaveBeenCalled();
    expect(Helix).not.toHaveBeenCalled();
  });

  it('should select chromicon by kebab case fallback name', () => {
    const ActivityFolder = jest.fn();
    stubIcons({ ActivityFolder });

    render(<Indicator name="unknown" fallbackName="activity-folder" />);

    expect(ActivityFolder).toHaveBeenCalled();
    expect(Helix).not.toHaveBeenCalled();
  });

  it('should select chromicon by aliased name', () => {
    const Burger = jest.fn();
    stubIcons({ Burger });

    render(<Indicator name="fast-food" />);

    expect(Burger).toHaveBeenCalled();
    expect(Helix).not.toHaveBeenCalled();
  });
});
