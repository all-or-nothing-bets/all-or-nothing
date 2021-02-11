import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { TwitterShareButton } from 'react-twitter-embed';
import { Button, Card, Space, Typography } from 'antd';
import './betConfirmed.css';

export default function BetConfirmed() {
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';
  const { Title, Text } = Typography;
  const withdrawBet = () => console.log('withdrawBet'); // to do: to implement withdraw
  // const { origin } = window.location;
  const path = `/bets/${questionId}`;
  // const tweet = `Put your money where your mouth is 🤑 @ I'm challenging you to a bet on "${question}"`;
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title>Bet locked</Title>
      <Space direction='vertical' size='large'>
        <Text type='secondary'>Fingers crossed!</Text>
        <Title level={4}>
          Send{' '}
          <Link to={path} component={Typography.Link}>
            this url
          </Link>{' '}
          to your counter party to make the bet official
        </Title>
        <Title level={5}>Make sure to only DM it to your counter party</Title>
        {/* <Card size='large'>{tweet}</Card> */}
        {/* <TwitterShareButton options={{ text: tweet, via: 'AllOrNothingBet' }} url={`${origin}${path}`} /> */}
        <Button type='default' htmlType='button' onClick={withdrawBet}>
          Withdraw my bet
        </Button>
      </Space>
    </div>
  );
}
