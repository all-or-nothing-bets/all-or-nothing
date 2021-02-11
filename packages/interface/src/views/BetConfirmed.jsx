import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { Button, Space, Typography } from 'antd';
import './betConfirmed.css';

export default function BetConfirmed() {
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';
  const { Title, Text } = Typography;
  const withdrawBet = () => console.log('withdrawBet'); // to do: to implement withdraw
  const path = `/bets/${questionId}`;
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 32 }}>
      <Title>Bet locked</Title>
      <Space direction='vertical' size='large'>
        <Text type='secondary'>Fingers crossed!</Text>
        <Title level={4} style={{ marginBottom: 0 }}>
          Send this{' '}
          <Link to={`${path}/match`} component={Typography.Link}>
            🔥 challenge url
          </Link>{' '}
          to your counterparty to make the bet official
        </Title>
        <Title level={5}>Make sure to only DM it to your counter party</Title>
        <Title level={5}>
          Save your{' '}
          <Link to={`${path}`} component={Typography.Link}>
            🏠 home url
          </Link>{' '}
          somewhere safe, you will need it to track your bet
        </Title>
        <Button type='default' htmlType='button' onClick={withdrawBet}>
          Withdraw my bet
        </Button>
      </Space>
    </div>
  );
}
