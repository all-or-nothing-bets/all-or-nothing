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

  describe("Simple flow", function () {
    it("Should deploy contracts", async function () {
      const BankBucks = await ethers.getContractFactory("BankBucks");
      const BankBucksVendor = await ethers.getContractFactory("BankBucksVendor");

      const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
      const CTHelpers = await ethers.getContractFactory("CTHelpers");
      const AMM = await ethers.getContractFactory("AMM");
      const Oracle = await ethers.getContractFactory("Oracle");

      bankBucks = await BankBucks.deploy();
      conditionalTokens = await ConditionalTokens.deploy();
      ctHelpers = await CTHelpers.deploy();

      bankBucksVendor = await BankBucksVendor.deploy(bankBucks.address);
      amm = await AMM.deploy(bankBucks.address, conditionalTokens.address);
      oracle = await Oracle.deploy(conditionalTokens.address);

      [user, bettor1, bettor2] = await ethers.getSigners();
      
      // Original link is: https://twitter.com/elonmusk/status/1357236825589432322
      // is is shortened down so it fits into 32bytes
      link = 'elonmusk/1357236825589432322';
      amount = '200';
      outcomes = [1,2];

      // transfer bucks to bettors
      await bankBucks.transfer(bettor1.address, amount);
      await bankBucks.transfer(bettor2.address, amount);
    });

    describe(" ", function () {
      it("Should create a bet", async function () {

        // generate question id from the twitter link
        questionId = ethers.utils.formatBytes32String(link);

        // approve tokens to be transfered to amm
        await bankBucks.connect(bettor1).approve(amm.address, amount);
        await bankBucks.connect(bettor2).approve(amm.address, amount);

        // create bet
        await amm.createWager(bettor1.address, bettor2.address, oracle.address, questionId, outcomes.length, amount);

        expect(await bankBucks.balanceOf(conditionalTokens.address)).to.equal(amount);

        // get ERC1155 ids
        let events = await conditionalTokens.queryFilter('TransferBatch');
        betIds = events[0].args.ids;

        // check the amount of ERC1155 tokens minted
        expect(await conditionalTokens.balanceOf(amm.address, betIds[0])).to.equal(amount);
        expect(await conditionalTokens.balanceOf(amm.address, betIds[1])).to.equal(amount);
      });
      it("Should buy a position", async function () {
        // approve tokens to be transfered to amm
        await bankBucks.approve(amm.address, amount);
        // create bet
        await amm.bet(betIds[0], amount);

        // check that the exchange has happened
        expect(await bankBucks.balanceOf(amm.address)).to.equal(amount);
        expect(await conditionalTokens.balanceOf(user.address, betIds[0])).to.equal(amount);
      });
      it("Should report a payout", async function () {
          await oracle.reportPayout(questionId, outcomes);
      });
      it("Should redeem", async function () {
          let conditionId = await conditionalTokens.getConditionId(oracle.address, questionId, outcomes.length);

          await amm.redeemTokens(conditionId, outcomes);
      });
    });
  });
});
