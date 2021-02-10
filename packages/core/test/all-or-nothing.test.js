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
  let amount;
  let outcomes;
  let betIds;

  describe(" ", function () {
    it("Should deploy contracts", async function () {
      const BankBucks = await ethers.getContractFactory("BankBucks");

      const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
      const CTHelpers = await ethers.getContractFactory("CTHelpers");
      const Oracle = await ethers.getContractFactory("Oracle");
      const WagerFactory = await ethers.getContractFactory("WagerFactory");

      bankBucks = await BankBucks.deploy();
      conditionalTokens = await ConditionalTokens.deploy();
      ctHelpers = await CTHelpers.deploy();

      oracle = await Oracle.deploy(conditionalTokens.address);

      wagerFactory = await WagerFactory.deploy(); 

      [user] = await ethers.getSigners();
      
      // Original link is: https://twitter.com/elonmusk/status/1357236825589432322
      // is is shortened down so it fits into 32bytes
      link = 'elonmusk/1357236825589432322';
      amount = '200';
      outcomes = [1,2];
    });

    describe(" ", function () {
      it("Should create a Wager contract and place innitial bet", async function () {
          // generate question id from the twitter link
          questionId = ethers.utils.formatBytes32String(link);

          // create new Wager contract through WagerFactory
          await wagerFactory.create(oracle.address, bankBucks.address, conditionalTokens.address, questionId);
          // connect attach contract to the Wager object
          let event = await wagerFactory.queryFilter('WagerCreated');
          const Wager = await ethers.getContractFactory("Wager");
          wager = Wager.attach(event[0].args[0]);
          
          // set allowance for erc20 token
          await bankBucks.approve(wager.address, amount);
          // set initial bet
          await wager.innitialBet(amount,0);
      });
      // it("Should report a payout", async function () {
      //     await oracle.reportPayout(questionId, outcomes);
      // });
      it("Should redeem", async function () {
          // let conditionId = await conditionalTokens.getConditionId(oracle.address, questionId, outcomes.length);

          // await amm.redeemTokens(conditionId, outcomes);
      });
    });
  });
});
