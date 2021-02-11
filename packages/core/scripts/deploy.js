/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, deployments, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const deploy = async (
  contractName,
  _args = [],
  overrides = {},
  libraries = {}
) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries,
  });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

const main = async () => {
  const ConditionalTokens = await deploy("ConditionalTokens");
  const BankBucks = await deploy("BankBucks");
  const CTVendor = await deploy("CTVendor", [
    BankBucks.address,
    ConditionalTokens.address,
  ]);

  await BankBucks.transfer(
    "0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8", // your wallet address here
    utils.parseEther("500")
  );
  [account0, account1, account2 ] = await ethers.getSigners();
  await BankBucks.transfer(account0.address, utils.parseEther("500"));
  await BankBucks.transfer(account1.address, utils.parseEther("500"));
  await BankBucks.transfer(account2.address, utils.parseEther("500"));

  const oracle = "0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8";

  const WagerFactory = await deploy("WagerFactory");
  await WagerFactory.setOracle(oracle); // random address, should be oracle smart contract
  await WagerFactory.setConditionalTokens(ConditionalTokens.address);

  // const accounts = await ethers.getSigners();
  // console.log('Accounts')
  // for (const account of accounts) {
  //   console.log(account.address);
  // }


  // hacky way to publish artifact but can't figure out how to get Hardhat to do it
  // const Wager = await artifacts.readArtifact("Wager");
  // const publishDir = "../interface/src/abis";
  // fs.writeFileSync(
  //   `${publishDir}/Wager.json`,
  //   JSON.stringify(Wager.abi, null, 2)
  // );
  // console.log(chalk.cyan(` 💾 Wager.json published in a hacky way to ${publishDir}`));
  
  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/core/artifacts/"),
    "\n\n"
  );
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 &&
  fileName.indexOf(".swp") < 0 &&
  fileName.indexOf(".swap") < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
