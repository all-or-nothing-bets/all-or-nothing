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

      [user, bettor1, bettor2 ] = await ethers.getSigners();
      
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
      it.only("Should create a Wager contract and place innitial bet", async function () {
          // generate question id from the twitter link
          questionId = ethers.utils.formatBytes32String(link);

          // create new Wager contract through WagerFactory
          await wagerFactory.create(oracle.address, bankBucks.address, conditionalTokens.address, questionId);
          // connect attach contract to the Wager object
          let event = await wagerFactory.queryFilter('WagerCreated');
          const Wager = await ethers.getContractFactory("Wager");
          wager = Wager.attach(event[0].args[0]);
          
          console.log('event[0]', event[0]);
          
          // set allowance for erc20 token
          await bankBucks.connect(bettor1).approve(wager.address, amount);
          // set initial bet
          await wager.connect(bettor1).innitialBet(amount,0);

          expect(await bankBucks.balanceOf(conditionalTokens.address)).to.equal(amount);

          // get ERC1155 ids
          let events = await conditionalTokens.queryFilter('TransferBatch');
          betIds = events[0].args.ids;

          // check the amount of ERC1155 tokens minted
          expect(await conditionalTokens.balanceOf(bettor1.address, betIds[0])).to.equal(amount);
          expect(await conditionalTokens.balanceOf(wager.address, betIds[1])).to.equal(amount);
      });
      it("Should create a second bet", async function () {
          // set allowance for erc20 token
          await bankBucks.connect(bettor2).approve(wager.address, amount);
          // set initial bet
          await wager.connect(bettor2).bet(amount,1);

          expect(await conditionalTokens.balanceOf(bettor2.address, betIds[1])).to.equal(amount);
          expect(await conditionalTokens.balanceOf(wager.address, betIds[0])).to.equal(amount);
      });
      it("Should buy tokens from AMM", async function () {
          await bankBucks.approve(wager.address, amount);

          await wager.buy(100, 0, 50); //TODO: fix magic values
      });
      it("Should report a payout", async function () {
          await oracle.reportPayout(questionId, outcomes);
      });
      it("Should redeem", async function () {
          // TODO

          // let conditionId = await conditionalTokens.getConditionId(oracle.address, questionId, outcomes.length);
          // await amm.redeemTokens(conditionId, outcomes);
      });
    });
  });
});
