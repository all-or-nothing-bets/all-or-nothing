const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("All or Nothing", function () {
  let bankBucks;
  let bankBucksVendor;
  let conditionalTokens;
  let ctHelpers;
  let wagerFactory;
  let wager;

  let oracle;
  let user;
  let link;
  let questionId;
  let endDateTime;
  let amount;
  let outcomes;
  // let betIds;

  const initBet = async () => {
    await bankBucks.connect(bettor1).approve(wager.address, amount);

    return await wager.connect(bettor1).initialBet(amount,0);

  };

  const secBet = async () => {
    await bankBucks.connect(bettor2).approve(wager.address, amount);

    return await wager.connect(bettor2).bet(amount,1);

  };

  const eventIds = async () => {
    let events = await conditionalTokens.queryFilter('TransferBatch');
    betIds = events[0].args.ids;
    return betIds;
  };

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const BankBucks = await ethers.getContractFactory("BankBucks");
    const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
    const CTHelpers = await ethers.getContractFactory("CTHelpers");
    const Oracle = await ethers.getContractFactory("Oracle");
    const WagerFactory = await ethers.getContractFactory("WagerFactory");

    // To deploy our contracts
    bankBucks = await BankBucks.deploy();
    conditionalTokens = await ConditionalTokens.deploy();
    ctHelpers = await CTHelpers.deploy();
    oracle = await Oracle.deploy(conditionalTokens.address);

    // Deploy WagerFactory and register oracle and CT addresses
    wagerFactory = await WagerFactory.deploy();
    await wagerFactory.setOracle(oracle.address);
    await wagerFactory.setConditionalTokens(conditionalTokens.address);

    // Create a questionID, set amouunt, outcomes, endDateTime
    link = 'elonmusk/1357236825589432322';
    questionId = ethers.utils.formatBytes32String(link);
    amount = '200';
    outcomes = [1,2];
    endDateTime = '1613855949';

    // create new Wager contract through WagerFactory
    await wagerFactory.create(bankBucks.address, questionId, endDateTime);

    // Attach contract to the Wager object
    let event = await wagerFactory.queryFilter('WagerCreated');
    const Wager = await ethers.getContractFactory("Wager");
    wager = Wager.attach(event[0].args[1]);

    // Roles
    [user, bettor1, bettor2 ] = await ethers.getSigners();

    // Transfer bucks to bettors
    await bankBucks.transfer(bettor1.address, amount);
    await bankBucks.transfer(bettor2.address, amount);
  });

    describe(" ", function () {
      it("Should place initial bet", async function () {
        // set allowance for erc20 token
        await bankBucks.connect(bettor1).approve(wager.address, amount);
        // set initial bet
        await wager.connect(bettor1).initialBet(amount,0);
        
        expect(await bankBucks.balanceOf(conditionalTokens.address)).to.equal(amount);

        // get ERC1155 ids
        betIds = await eventIds();

        // check the amount of ERC1155 tokens minted
        expect(await conditionalTokens.balanceOf(bettor1.address, betIds[0])).to.equal(amount);
        expect(await conditionalTokens.balanceOf(wager.address, betIds[1])).to.equal(amount);
      });

      it("Should create a second bet", async function () {
        await initBet();

        betIds = await eventIds();

        // set allowance for erc20 token
        await bankBucks.connect(bettor2).approve(wager.address, amount);
        // set second bet
        await wager.connect(bettor2).bet(amount,1);

        // check the amount of ERC1155 tokens minted
        expect(await conditionalTokens.balanceOf(bettor2.address, betIds[1])).to.equal(amount);
        expect(await conditionalTokens.balanceOf(wager.address, betIds[0])).to.equal(amount);
      });

      it("Should buy tokens from AMM", async function () {
          await initBet();
          await secBet();

          await bankBucks.approve(wager.address, amount);

          await wager.buy(100, 0, 50); //TODO: fix magic values
      });

      it("Should report a payout", async function () {
          await oracle.reportPayout(questionId, outcomes);
      });
      it.skip("Should redeem", async function () {
          // TODO

          // let conditionId = await conditionalTokens.getConditionId(oracle.address, questionId, outcomes.length);
          // await amm.redeemTokens(conditionId, outcomes);
      });
    });
  });

