const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

  const Oracle = await ethers.getContractFactory("Oracle");
  let oracle = Oracle.attach("0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8");

  await oracle.reportPayout();

  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
