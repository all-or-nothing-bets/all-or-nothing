/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import './App.css';
import { Row, Col, Button, Menu, Alert } from 'antd';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { formatEther, parseEther } from '@ethersproject/units';
import { useUserAddress } from 'eth-hooks';
import {
  useExchangePrice,
  useGasPrice,
  useUserProvider,
  useContractLoader,
  useContractReader,
  useEventListener,
  useBalance,
  // useExternalContractLoader,
} from './hooks';
import LoadingContextProvider from './contexts/loadingContext';
import { Header, Account, Faucet, Ramp, GasGauge } from './components';
import { Transactor } from './helpers';

// import Hints from "./Hints";

import {
  BetFirst,
  BetSecond,
  BetCommunity,
  BetConfirmed,
  MatchConfirmed,
  CommunityConfirmed,
  BettorHome,
  DecideBet,
  Oracle,
  SetQuestion,
} from './views';
// eslint-disable-next-line no-unused-vars
import { INFURA_ID, NETWORK, NETWORKS } from './constants';

const targetNetwork = NETWORKS.localhost; // localhost, rinkeby, xdai, mainnet

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log('📡 Connecting to Mainnet Ethereum');
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider('https://mainnet.infura.io/v3/' + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/interface/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log('🏠 Connecting to provider:', localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, 'fast');
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log('👩‍💼 selected address:', address);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  if (DEBUG) console.log('🏠 localChainId', localChainId);

  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  if (DEBUG) console.log('🕵🏻‍♂️ selectedChainId:', selectedChainId);

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  const yourLocalBalance = useBalance(localProvider, address);
  if (DEBUG) console.log('💵 yourLocalBalance', yourLocalBalance ? formatEther(yourLocalBalance) : '...');

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if (DEBUG) console.log('💵 yourMainnetBalance', yourMainnetBalance ? formatEther(yourMainnetBalance) : '...');

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  if (DEBUG) console.log('📝 readContracts', readContracts);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);
  if (DEBUG) console.log('🔐 writeContracts', writeContracts);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)
  // console.log("🥇DAI contract on mainnet:",mainnetDAIContract)
  //
  // Then read your DAI balance like:
  // const myMainnetBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])
  // console.log("💲 myMainnetBalance:",myMainnetBalance)
  //

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, 'YourContract', 'purpose');
  // if (DEBUG) console.log('🤗 purpose:', purpose);

  // 📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(readContracts, 'YourContract', 'SetPurpose', localProvider, 1);
  // if (DEBUG) console.log('📟 SetPurpose events:', setPurposeEvents);

  const Condition = useEventListener(readContracts, 'ConditionalTokens', 'ConditionPreparation', localProvider, 1);
  // if (Condition.length) console.log('Condition preparation events', Condition);

  const Wagers = useEventListener(readContracts, 'WagerFactory', 'WagerCreated', localProvider, 1);
  // if (Wagers) console.log('WagerCreated', Wagers);

  // const Balance = useEventListener(readContracts, 'CTVendor', 'LogCollateralBalance', localProvider, 1);
  // if (Balance.length) console.log('LogCollateralBalance events', Balance);

  // const Amount = useEventListener(readContracts, 'CTVendor', 'LogAmount', localProvider, 1);
  // if (Amount.length) console.log('Amount events', Amount);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */
  let networkDisplay = '';
  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16 }}>
        <Alert
          message='⚠️ Wrong Network'
          description={
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{' '}
              <b>{NETWORK(localChainId).name}</b>.
            </div>
          }
          type='error'
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: 'absolute', right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = '';
  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type='primary'
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther('0.01'),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return (
    <div className='App'>
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <LoadingContextProvider>
          <Switch>
            <Route exact path='/'>
              <SetQuestion writeContracts={writeContracts} />
            </Route>
            <Route path='/bets/:questionId/initial'>
              <BetFirst signer={userProvider.getSigner()} writeContracts={writeContracts} />
            </Route>
            <Route path='/bets/:questionId/match'>
              <BetSecond signer={userProvider.getSigner()} writeContracts={writeContracts} />
            </Route>
            <Route path='/bets/:questionId/community'>
              <BetCommunity signer={userProvider.getSigner()} writeContracts={writeContracts} />
            </Route>
            <Route path='/bets/:questionId/initial-confirmed'>
              <BetConfirmed />
            </Route>
            <Route path='/bets/:questionId/match-confirmed'>
              <MatchConfirmed />
            </Route>
            <Route path='/bets/:questionId/community-confirmed'>
              <CommunityConfirmed />
            </Route>
            <Route path='/bets/:questionId/decide-bet'>
              <DecideBet
                address={address}
                signer={userProvider.getSigner()}
                readContracts={readContracts}
                writeContracts={writeContracts}
              />
            </Route>
            <Route path='/bets/:questionId/oracle'>
              <Oracle
                address={address}
                signer={userProvider.getSigner()}
                readContracts={readContracts}
                writeContracts={writeContracts}
              />
            </Route>
            <Route exact path='/bets/:questionId'>
              <BettorHome
                address={address}
                signer={userProvider.getSigner()}
                readContracts={readContracts}
                writeContracts={writeContracts}
              />
            </Route>
          </Switch>
        </LoadingContextProvider>
      </BrowserRouter>

      <div style={{ position: 'fixed', textAlign: 'right', right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: 'fixed', textAlign: 'left', left: 0, bottom: 20, padding: 10 }}>
        {/* <Row align='middle' gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: 'center', opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: 'center', opacity: 1 }}>
            <Button
              onClick={() => {
                window.open('https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA');
              }}
              size='large'
              shape='round'
            >
              <span style={{ marginRight: 8 }} role='img' aria-label='support'>
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row> */}

        <Row align='middle' gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              localProvider &&
              localProvider.connection &&
              localProvider.connection.url &&
              localProvider.connection.url.indexOf(window.location.hostname) >= 0 &&
              !process.env.REACT_APP_PROVIDER &&
              price > 1 ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ''
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

/*
Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});
const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

// eslint-disable-next-line no-unused-expressions
window.ethereum &&
  // eslint-disable-next-line no-unused-vars
  window.ethereum.on('chainChanged', chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
