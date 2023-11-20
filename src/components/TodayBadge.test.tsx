import React from 'react';
import { render } from '@testing-library/react-native';
import * as TodayTasksModule from '../hooks/todayTile/useTodayTasks';
import TodayBadge from './TodayBadge';

const useTodayTasksMock = jest.spyOn(TodayTasksModule, 'useTodayTasks');

test('does not render badge if no counts', () => {
  useTodayTasksMock.mockReturnValue({
    incompleteActivitiesCount: 0,
    newTasks: [],
  } as any);
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
  } as any);
  const badge = render(<TodayBadge />);
  expect(badge.getByText('5')).toBeDefined();
});
