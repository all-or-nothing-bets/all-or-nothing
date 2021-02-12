import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { TwitterShareButton } from 'react-twitter-embed';
import { Button, Card, Space, Typography } from 'antd';

export default function CommunityConfirmed() {
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';
  const { Title, Text } = Typography;
  const withdrawBet = () => console.log('withdrawBet'); // to do: to implement withdraw
  const { origin } = window.location;
  const path = `/bets/${questionId}`;
  const tweet = `Put your money where your mouth is 🤑 - "${question}" - I'm challenging you to a bet`;
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 500, margin: 'auto', marginTop: 32 }}>
      <Title>Bet confirmed</Title>
      <Space direction='vertical' size='large'>
        <Text type='secondary'>Fingers crossed!</Text>
        <Title level={4}>
          Save your{' '}
          <Link to={`${path}`} component={Typography.Link}>
            🏠 home url
          </Link>{' '}
          somewhere safe, you will need it to track your bet
        </Title>
        <Title level={5}>
          Share this{' '}
          <Link to={`${path}/community`} component={Typography.Link}>
            💰 bet url
          </Link>{' '}
          with others to invite them to bet for or against you. You can win more if other people make bets.{' '}
        </Title>
        <Card size='large'>{tweet}</Card>
        <TwitterShareButton options={{ text: tweet, via: 'AllOrNothingBet' }} url={`${origin}${path}/community`} />
        <Button type='default' htmlType='button' onClick={withdrawBet}>
          Withdraw my bet
        </Button>
      </Space>
    </div>
  );
}
