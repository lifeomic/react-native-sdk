import React, { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useIcons } from './BrandConfigProvider/icons/IconProvider';

type HeaderLeftRefreshButtonProps = {
  refreshing: boolean;
  onRefresh: () => void;
};

export const HeaderLeftRefreshButton = ({
  refreshing,
  onRefresh,
}: HeaderLeftRefreshButtonProps) => {
  const { RefreshCw } = useIcons();
  const icon = useMemo(
    () => (refreshing ? () => <ActivityIndicator /> : RefreshCw),
    [refreshing, RefreshCw],
  );
  return <Appbar.Action icon={icon} onPress={onRefresh} />;
};
