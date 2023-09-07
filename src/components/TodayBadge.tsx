import React from 'react';
import { Badge } from 'react-native-paper';
import { isConsentTask, useTodayTasks } from '../hooks/todayTile/useTodayTasks';
import { t } from 'i18next';
import { useFocusEffect } from '@react-navigation/native';

const TodayBadge = () => {
  const { newTasks, incompleteActivitiesCount, refetch } = useTodayTasks();
  useFocusEffect(refetch);

  const filteredTasks = newTasks.filter((task) => {
    return (
      isConsentTask(task) ||
      // Don't include program surveys because they are contained in the incompleteActivitiesCount
      !!task.meta?.tag.every(
        (tag) => tag.system !== 'http://lifeomic.com/fhir/program/activitySlug',
      )
    );
  });

  const badgeCount = filteredTasks.length + (incompleteActivitiesCount ?? 0);

  return badgeCount > 0 ? (
    <Badge
      accessibilityLabel={t(
        'badge-count-accessibility-label',
        '{{ badgeCount }} activities to complete',
        {
          badgeCount,
        },
      )}
    >
      {badgeCount}
    </Badge>
  ) : null;
};

export default TodayBadge;
