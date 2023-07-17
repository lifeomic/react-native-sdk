import React, { useState } from 'react';
import { storiesOf } from '@storybook/react-native';
import { withKnobs } from '@storybook/addon-knobs';
import { SafeView } from '../../helpers/SafeView';
import { Button } from 'react-native-paper';
import { DeveloperConfigProvider, useDeveloperConfig } from '../../../../src';
import {
  PointBreakdown,
  PointBreakdownProps,
  createPointBreakdown,
} from '../../../../src/components/SocialShare/renderers/point-breakdown';
import { SocialShareExporter } from '../../../../src/components/SocialShare/SocialShareExporter';
import { View, Text } from 'react-native';

storiesOf('SharingRenderers', module)
  .addDecorator(withKnobs)
  .add('default', () => <Example />)
  .add('custom Footer', () => (
    <DeveloperConfigProvider
      developerConfig={{
        sharingRenderers: {
          pointBreakdown: createPointBreakdown({
            Footer: (
              <View
                style={{
                  width: '100%',
                  borderColor: 'black',
                  backgroundColor: 'red',
                  borderBottomWidth: 1,
                  padding: 25,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  Custom Footer
                </Text>
              </View>
            ),
          }),
        },
      }}
    >
      <Example />
    </DeveloperConfigProvider>
  ));

const Example = () => {
  const [metadata, setMetadata] = useState<any>();
  const data: Omit<PointBreakdownProps, 'onLoad'> = {
    dataUri:
      'https://docs.oracle.com/middleware/12211/adf/tag-reference-dvt/images/chart/lineChart.png?',
    dateRange: [new Date(), new Date()],
    title: 'Example Share',
    selectedPoints: [
      {
        y: 5,
        x: +new Date(),
        size: undefined,
        trace: {
          coding: [],
          label: 'Example Data',
          type: 'Observation',
        },
      },
    ],
  };

  return (
    <SafeView>
      <View style={{ alignItems: 'center' }}>
        <Button
          onPress={() =>
            setMetadata({
              ...data,
              dataUri: `${data.dataUri.split('?')[0]}?t=${Number(new Date())}`,
            })
          }
          style={{ width: 200 }}
          mode="outlined"
        >
          Share Content
        </Button>
      </View>
      <ExportPreview data={data} />
      <SocialShareExporter type="pointBreakdown" metadata={metadata} />
    </SafeView>
  );
};

const ExportPreview = ({ data }: { data: any }) => {
  const { sharingRenderers } = useDeveloperConfig();
  const Renderer = sharingRenderers?.pointBreakdown ?? PointBreakdown;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          borderColor: 'black',
          borderWidth: 1,
          borderBottomWidth: 0,
          margin: 30,
        }}
      >
        <Renderer {...data} onLoad={() => {}} />
      </View>
    </View>
  );
};
