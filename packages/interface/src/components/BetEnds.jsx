import React from 'react';
import { Space, Typography } from 'antd';

export default function BenEnds({ utcDateTime }) {
  const { Text } = Typography;
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let localDateTime;
  if (utcDateTime) localDateTime = utcDateTime.toLocaleDateString('en-US', options);
  return (
    <Space direction='vertical' style={{ fontSize: 14, fontStyle: 'italic' }}>
      <Text>This bet will close on {localDateTime}</Text>
      <Text type='secondary'>Please note it will take 6 days from the chosen date for the answer to be confirmed.</Text>
    </Space>
  );
}
