import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { TwitterShareButton } from 'react-twitter-embed';
import { Button, Card, Space, Typography } from 'antd';
import './matchConfirmed.css';

export default function MatchConfirmed() {
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';
  const { Title, Text } = Typography;
  const withdrawBet = () => console.log('withdrawBet'); // to do: to implement withdraw
  const { origin } = window.location;
  const path = `/bets/${questionId}`;
  const tweet = `We have a wager on "${question}" - Care to join us?`;
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title>Bet confirmed</Title>
      <Space direction='vertical' size='large'>
        <Text type='secondary'>Fingers crossed!</Text>
        <Title level={4}>
          Save your{' '}
          <Link to={path} component={Typography.Link}>
            unique url
          </Link>{' '}
          somewhere safe, you will need it to track your bet
        </Title>
        <Title level={5}>
          Invite others to bet against you. You or the initial bettor stand to win more if other people make side bets.{' '}
        </Title>
        <Card size='large'>{tweet}</Card>
        <TwitterShareButton options={{ text: tweet, via: 'AllOrNothingBet' }} url={`${origin}${path}`} />
        <Button type='default' htmlType='button' onClick={withdrawBet}>
          Withdraw my bet
        </Button>
      </Space>
    </div>
  );
}
