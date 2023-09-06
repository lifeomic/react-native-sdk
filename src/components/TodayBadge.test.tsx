import React from 'react';
import { render } from '@testing-library/react-native';
import { useTodayTasks } from '../hooks/todayTile/useTodayTasks';
import TodayBadge from './TodayBadge';

jest.mock('../hooks/todayTile/useTodayTasks', () => ({
  ...jest.requireActual('../hooks/todayTile/useTodayTasks'),
  useTodayTasks: jest.fn(),
}));

const useTodayTasksMock = useTodayTasks as jest.Mock;

test('does not render badge if no counts', () => {
  useTodayTasksMock.mockReturnValue({
    incompleteActivitiesCount: 0,
    newTasks: [],
  });
  const badge = render(<TodayBadge />);
  expect(badge.toJSON()).toBe(null);
});

test('renders badge with counts', () => {
  const tasks: any[] = [
    { meta: { tag: [{ system: '' }] } },
    { meta: { tag: [{ system: '' }] } },
    { meta: { tag: [{ system: '' }] } },
  ];
  useTodayTasksMock.mockReturnValue({
    incompleteActivitiesCount: 2,
    newTasks: tasks,
  });
  const badge = render(<TodayBadge />);
  expect(badge.getByText('5')).toBeDefined();
});
