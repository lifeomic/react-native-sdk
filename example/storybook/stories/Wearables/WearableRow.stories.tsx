import React, { FC, useState, useReducer } from 'react';
import { Text, View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import {
  SwitchRowDefaultStyles,
  SwitchRowProps,
} from '../../../../src/components/Wearables//SwitchRow';
import {
  WearableRow,
  WearableRowDefaultStyles,
  WearableRowProps,
} from '../../../../src/components/Wearables//WearableRow';
import {
  ToggleWearableResult,
  WearableIntegration,
  WearableIntegrationStatus,
} from '@lifeomic/wearables-sync';
import { Button } from 'react-native';
import { EHRType } from '@lifeomic/ehr-core';

storiesOf('Wearable Row', module)
  .addDecorator(withKnobs)
  .add('default', () => <DefaultView />)
  .add('disabled', () => <WearableRow {...baseProps} disabled={true} />)
  .add('needs auth', () => (
    <WearableRow
      {...baseProps}
      wearable={{
        ...exampleWearable,
        status: WearableIntegrationStatus.NeedsAuthorization,
      }}
    />
  ))
  .add('no syncTypes configured', () => (
    <WearableRow
      {...baseProps}
      wearable={{
        ...exampleWearable,
        syncTypes: [],
      }}
    />
  ))
  .add('custom switch row', () => {
    interface CustomSwitchRowProps extends Omit<SwitchRowProps, 'title'> {
      /*
        NOTE: Trying to demonstrate a component we want to reuse that
        doesn't take the same exact params. Need WearableSwitchRow below.
      */
      name: string;
    }
    const CustomSwitchRow: FC<CustomSwitchRowProps> = (props) => {
      const [value, toggleValue] = useReducer((state) => {
        props.onValueChange(!state);
        return !state;
      }, props.value);
      return (
        <>
          <Text>{props.name}</Text>
          <Text>{value ? 'ON' : 'OFF'}</Text>
          <View style={{ width: 100 }}>
            <Button onPress={toggleValue} title="Toggle" />
          </View>
        </>
      );
    };

    /*
      Consumers will likely need to create a type like this which
      wraps their desired SwitchRow replacement but also satisfies
      SwitchRowProps.
    */
    const WearableSwitchRow: FC<SwitchRowProps> = (props) => {
      const { title, ...otherProps } = props;
      return <CustomSwitchRow name={title} {...otherProps} />;
    };
    return <DefaultView CustomSwitchRow={WearableSwitchRow} />;
  });

export const rowActions = {
  onError: action('onError'),
  onRefreshNeeded: action('onRefreshNeeded'),
  onShowWearableAuth: action('onShowWearableAuth'),
  onShowLearnMore: action('onShowLearnMore'),
  onToggleWearable: async (ehrId: string, enabled: boolean) => {
    action('onToggleWearable')(ehrId, enabled);
    return {
      authorizationUrl: 'url-for-oauth-flow',
    } as ToggleWearableResult;
  },
  onToggleBackgroundSync: async (
    wearable: WearableIntegration,
    enabled: boolean,
  ) => {
    action('onToggleBackgroundSync')(wearable, enabled);
    return {
      authorizationUrl: 'url-for-oauth-flow',
    } as ToggleWearableResult;
  },
};

const exampleWearable = {
  ehrId: EHRType.Fitbit,
  ehrType: EHRType.Fitbit,
  name: 'Fitbit',
  enabled: true,
  status: WearableIntegrationStatus.Syncing,
};

const baseProps = {
  ...rowActions,
  wearable: exampleWearable,
} as WearableRowProps;

interface Props {
  CustomSwitchRow?: React.ComponentType<SwitchRowProps>;
}

const DefaultView: FC<Props> = (props) => {
  const [enabled, setEnabled] = useState(false);

  const onToggleWearable = async (ehrId: string, enabled: boolean) => {
    const result = rowActions.onToggleWearable(ehrId, enabled);
    setEnabled(enabled);
    return result;
  };

  const onToggleBackgroundSync = async (
    enabledWearable: WearableIntegration,
    enabled: boolean,
  ) => {
    const result = rowActions.onToggleBackgroundSync(enabledWearable, enabled);
    setEnabled(enabled);
    return result;
  };

  const defaultProps = {
    ...rowActions,
    wearable: {
      ...exampleWearable,
      enabled: enabled,
      status: enabled ? WearableIntegrationStatus.Syncing : undefined,
    },
    onToggleWearable,
    onToggleBackgroundSync,
    CustomSwitchRow: props.CustomSwitchRow,
  } as WearableRowProps;

  return (
    <WearableRow
      {...defaultProps}
      disabled={boolean('disabled', !!defaultProps.disabled)}
      styles={object('styles', {
        ...WearableRowDefaultStyles,
        switchRow: SwitchRowDefaultStyles,
      })}
      wearable={object('wearable', defaultProps.wearable)}
    />
  );
};
