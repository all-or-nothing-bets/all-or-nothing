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
  let outcomes;
  let amount;

  describe("Create bet", function () {
    it("Should deploy contracts", async function () {
      const BankBucks = await ethers.getContractFactory("BankBucks");
      const BankBucksVendor = await ethers.getContractFactory("BankBucksVendor");

      const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
      const CTHelpers = await ethers.getContractFactory("CTHelpers");
      const AMM = await ethers.getContractFactory("AMM");

      bankBucks = await BankBucks.deploy();
      conditionalTokens = await ConditionalTokens.deploy();
      ctHelpers = await CTHelpers.deploy();

      bankBucksVendor = await BankBucksVendor.deploy(bankBucks.address);
      amm = await AMM.deploy(bankBucks.address, conditionalTokens.address);

      // TODO: change to oracle contract later
      [user, oracle] = await ethers.getSigners();
      
      // Original link is: https://twitter.com/elonmusk/status/1357236825589432322
      // is is shortened down so it fits into 32bytes
      link = 'elonmusk/1357236825589432322';
      outcomes = ['doge', 'no doge'];
      amount = '200';
    });

    describe(" ", function () {
      it("Should create a bet", async function () {

        // generate question id from the twitter link
        questionId = ethers.utils.formatBytes32String(link);

        // approve tokens to be transfered to amm
        await bankBucks.approve(amm.address, amount);
        // create bet
        await amm.createBet(oracle.address, questionId, outcomes.length, amount);

        // get ERC1155 ids
        let events = await conditionalTokens.queryFilter('TransferBatch');
        let ids = events[0].args.ids;

        // check the amount of ERC1155 tokens minted
        expect(await conditionalTokens.balanceOf(amm.address, ids[0])).to.equal(amount);
        expect(await conditionalTokens.balanceOf(amm.address, ids[1])).to.equal(amount);
      });
    });
  });
});
