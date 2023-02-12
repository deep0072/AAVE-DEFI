const { ethers, getNamedAccounts } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth() {
  const wrapEthTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const { deployer } = await getNamedAccounts();

  const iWeth = await ethers.getContractAt(
    "IWeth",
    wrapEthTokenAddress,
    deployer
  );

  const tx = await iWeth.deposit({ value: AMOUNT });
  await tx.wait(1);

  const balanceOf = await iWeth.balanceOf(deployer);

  console.log(`balance of wrapEth is ${balanceOf.toString()}`);
}

module.exports = { getWeth, AMOUNT };
