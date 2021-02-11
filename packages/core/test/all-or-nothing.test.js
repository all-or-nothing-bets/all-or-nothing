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
  let betIds;

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
    outcomes = [0,1];

    endDateTime = '1613855949';

    // create new Wager contract through WagerFactory
    await wagerFactory.create(bankBucks.address, questionId, endDateTime);

    // Attach contract to the Wager object
    let event = await wagerFactory.queryFilter('WagerCreated');
    const Wager = await ethers.getContractFactory("Wager");
    wager = Wager.attach(event[0].args[1]);

    // Roles
    [user, bettor1, bettor2, bettor3, bettor4, bettor5, bettor6] = await ethers.getSigners();
    

    // Transfer bucks to bettors
    await bankBucks.transfer(bettor1.address, amount);
    await bankBucks.transfer(bettor2.address, amount);
    await bankBucks.transfer(bettor3.address, amount);
    await bankBucks.transfer(bettor4.address, amount);
    await bankBucks.transfer(bettor5.address, amount);
    await bankBucks.transfer(bettor6.address, amount);
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

          
          await bankBucks.connect(bettor3).approve(wager.address, amount);
          await wager.connect(bettor3).buy(100,0);

          // get ERC1155 ids
          betIds = await eventIds();
          
          //check bettor3 CT balance position0
          let bettor3CtBalance = await conditionalTokens.balanceOf(bettor3.address, betIds[0]);
          console.log("Bettor 3 position 0 balance", bettor3CtBalance.toNumber());
          //check AMM CT Balances
          let ammPosition0 = await conditionalTokens.balanceOf(wager.address, betIds[0]);
          console.log("AMM position 0 balance", ammPosition0.toNumber());
          let ammPosition1 = await conditionalTokens.balanceOf(wager.address, betIds[1]);
          console.log("AMM position 1 balance", ammPosition1.toNumber());

          //bettor 4 bets on position 1 
          await bankBucks.connect(bettor4).approve(wager.address, amount);
          await wager.connect(bettor4).buy(50,1);

          //check bettor4 CT balance position0
          let bettor4CtBalance = await conditionalTokens.balanceOf(bettor4.address, betIds[1]);
          console.log("Bettor 4 position 1 balance", bettor4CtBalance.toNumber());
          //check AMM CT Balances
          let bet4ammPosition0 = await conditionalTokens.balanceOf(wager.address, betIds[0]);
          console.log("AMM position 0 balance", bet4ammPosition0.toNumber());
          let bet4ammPosition1 = await conditionalTokens.balanceOf(wager.address, betIds[1]);
          console.log("AMM position 1 balance", bet4ammPosition1.toNumber());

          //bettor 5 bets on position 0 
          await bankBucks.connect(bettor5).approve(wager.address, amount);
          await wager.connect(bettor5).buy(20,0);

          //check bettor 5 positions 
          let bettor5CtBalance = await conditionalTokens.balanceOf(bettor5.address, betIds[0]);
          console.log("Bettor 5 position 1 balance", bettor5CtBalance.toNumber());

          //check AMM CT Balances
          let bet5ammPosition0 = await conditionalTokens.balanceOf(wager.address, betIds[0]);
          console.log("AMM position 0 balance", bet5ammPosition0.toNumber());
          let bet5ammPosition1 = await conditionalTokens.balanceOf(wager.address, betIds[1]);
          console.log("AMM position 1 balance", bet5ammPosition1.toNumber());

          //bettor 6 bets on position 1
          await bankBucks.connect(bettor6).approve(wager.address, amount);
          await wager.connect(bettor6).buy(1,1);

          //check bettor 6 positions 
          let bettor6CtBalance = await conditionalTokens.balanceOf(bettor6.address, betIds[1]);
          console.log("Bettor 6 position 1 balance", bettor5CtBalance.toNumber());

          //check AMM CT Balances
          let bet6ammPosition0 = await conditionalTokens.balanceOf(wager.address, betIds[0]);
          console.log("AMM position 0 balance", bet6ammPosition0.toNumber());
          let bet6ammPosition1 = await conditionalTokens.balanceOf(wager.address, betIds[1]);
          console.log("AMM position 1 balance", bet6ammPosition1.toNumber());
      });

      it("Should report a payout", async function () {
          await initBet();
          await secBet();

          await oracle.reportPayout(questionId, outcomes);
      });
      it("Should redeem", async function () {
          await initBet();
          await secBet();

          await oracle.reportPayout(questionId, [1,0]);
          await wager.resolve(0, [1,2]);

          await conditionalTokens.connect(bettor1).setApprovalForAll(wager.address, true);

          betIds = await eventIds();

          await wager.connect(bettor1).withdraw();

          expect(await bankBucks.balanceOf(conditionalTokens.address)).to.equal(0);
      });

      it("Should redeem init bettors 100% return", async function () {
        await initBet();
        await secBet();

        //bettor 3 buys
        await bankBucks.connect(bettor3).approve(wager.address, amount);
        await wager.connect(bettor3).buy(100,0);

        //bettor 4 buys
        await bankBucks.connect(bettor4).approve(wager.address, amount);
        await wager.connect(bettor4).buy(50,1);

        // get ERC1155 ids
        betIds = await eventIds();
          
        //check bettor3 CT balance position0
        let bettor3CtBalance = await conditionalTokens.balanceOf(bettor3.address, betIds[0]);
        console.log("Bettor 3 position 0 balance", bettor3CtBalance.toNumber());

        //Resolve Market
        await oracle.reportPayout(questionId, [1,0]);
        await wager.resolve(0, [1,2]);

        //init bettor 1 withdraw
        await conditionalTokens.connect(bettor1).setApprovalForAll(wager.address, true);
        await wager.connect(bettor1).withdraw();
        
        let bettor1Collateral = await bankBucks.balanceOf(bettor1.address);
        console.log("Bettor1 ERC20", bettor1Collateral.toNumber());
        expect(await bankBucks.balanceOf(bettor1.address)).to.equal(400);

        //init bettor 3 withdraw
        await conditionalTokens.connect(bettor3).setApprovalForAll(wager.address, true);
        //check collateral remainging in contract
        let wagerCollateral = await bankBucks.balanceOf(wager.address);
        console.log("Wager collateral", wagerCollateral.toNumber());
        
        let CTFCollateral = await bankBucks.balanceOf(conditionalTokens.address);
        console.log("CTF collateral", CTFCollateral.toNumber());
        await wager.connect(bettor3).withdraw();
        let bettor3postwithdrawCollateralBalance = await bankBucks.balanceOf(bettor3.address);
        console.log("Bettor 3 collaterla balance post withdraw", bettor3postwithdrawCollateralBalance.toNumber());

        //bettor 4 withdrawal
        


      });




    });
  });

