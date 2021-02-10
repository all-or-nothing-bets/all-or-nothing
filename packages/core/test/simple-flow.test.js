const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Bet creation flow", function () {
  let bankBucks;
  let bankBucksVendor;
  let conditionalTokens;
  let ctHelpers;
  let amm;

  let oracle;
  let user;
  let link;
  let questionId;
  let amount;
  let outcomes;
  let betIds;
  let bettor1;
  let bettor2;

  let minTokensToBuy;
  let outcomeIndex;

  let betAmount;

  describe("All or Nothing", function () {
    it("Should deploy contracts", async function () {
      const BankBucks = await ethers.getContractFactory("BankBucks");

      const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
      const CTHelpers = await ethers.getContractFactory("CTHelpers");
      const AMM = await ethers.getContractFactory("AMM");
      const Oracle = await ethers.getContractFactory("Oracle");

      bankBucks = await BankBucks.deploy();
      conditionalTokens = await ConditionalTokens.deploy();
      ctHelpers = await CTHelpers.deploy();

      amm = await AMM.deploy(bankBucks.address, conditionalTokens.address);
      oracle = await Oracle.deploy(conditionalTokens.address);

      [user, bettor1, bettor2] = await ethers.getSigners();
      
      // Original link is: https://twitter.com/elonmusk/status/1357236825589432322
      // is is shortened down so it fits into 32bytes
      link = 'elonmusk/1357236825589432322';
      amount = '500';
      initReward = '1000';
      outcomes = [1,2];

      betAmount = '150';

      minTokensToBuy = '50';
      outcomeIndex = '0';

      // transfer bucks to bettors
      await bankBucks.transfer(bettor1.address, amount);
      await bankBucks.transfer(bettor2.address, amount);
    });

    describe(" ", function () {
      it("Should create a wager", async function () {

        // generate question id from the twitter link
        questionId = ethers.utils.formatBytes32String(link);

        // approve tokens to be transfered to amm
        await bankBucks.connect(bettor1).approve(amm.address, amount);
        await bankBucks.connect(bettor2).approve(amm.address, amount);

        // create bet
        await amm.createWager(bettor1.address, bettor2.address, oracle.address, questionId, outcomes.length, amount);

        expect(await bankBucks.balanceOf(conditionalTokens.address)).to.equal(initReward);

        // get ERC1155 ids
        let events = await conditionalTokens.queryFilter('TransferBatch');
        betIds = events[0].args.ids;

        // check the amount of ERC1155 tokens minted
        expect(await conditionalTokens.balanceOf(amm.address, betIds[0])).to.equal(initReward);
        expect(await conditionalTokens.balanceOf(amm.address, betIds[1])).to.equal(initReward);
      });
      it("Should place a bet", async function () {
        // approve tokens to be transfered to amm
        await bankBucks.approve(amm.address, betAmount);

        await console.log((await conditionalTokens.balanceOf(amm.address, betIds[0])).toString());

        // create bet
        await amm.bet(oracle.address, questionId, outcomes.length, betAmount);

        await console.log((await conditionalTokens.balanceOf(amm.address, betIds[0])).toString());
        // check that the exchange has happened
        // expect(await conditionalTokens.balanceOf(user.address, betIds[0])).to.equal(betAmount);
      });
      it("Should report a payout", async function () {
          await oracle.reportPayout(questionId, outcomes);
      });
      // it("Should redeem", async function () {
      //     let conditionId = await conditionalTokens.getConditionId(oracle.address, questionId, outcomes.length);

      //     await amm.redeemTokens(conditionId, outcomes);
      // });
    });
  });
});
