import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View, Text } from 'react-native';

export default function DashboardChart({ title, labels, values, yLabel }) {
  const screenWidth = Dimensions.get('window').width - 40;
  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>{title}</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: values,
            },
          ],
        }}
        width={screenWidth}
        height={220}
        yAxisLabel={yLabel ? yLabel + ' ' : ''}
        chartConfig={{
          backgroundColor: '#11162a',
          backgroundGradientFrom: '#11162a',
          backgroundGradientTo: '#0b0f19',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(79, 124, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(199, 203, 224, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#4f7cff' },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
