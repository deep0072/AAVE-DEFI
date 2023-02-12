const { ethers, getNamedAccounts } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const wrapEthTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
async function main() {
  //convert  eth into wrap eth
  await getWeth();

  /*
  1. now deposit eth into landingpool
    a. first get landingpool address provider which give address of landinpool
    b. then use the deposite method of landingpool contract.
    but to deposit into landing pool. we need to give approval 

  
  
  
  */

  const { deployer } = await getNamedAccounts();

  const lendingPool = await getLendingPool(deployer);

  await erc20Approval(
    wrapEthTokenAddress,
    lendingPool.address,
    AMOUNT,
    deployer
  );

  //deposit

  await lendingPool.deposit(wrapEthTokenAddress, AMOUNT, deployer, 0);

  // now time to borrow
  /*
   but to borrow we first need to get the userData like how much collateral deposited
   , how much debt is, how much amount can be borrowed
  
  
  */
}

// approval
async function erc20Approval(
  erc20Address,
  spenderAddress,
  amountToken,
  account
) {
  const erc20Contract = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Contract.approve(spenderAddress, amountToken);
  await tx.wait(1);
  console.log("approved");
}

// get Lending pool address provider

async function getLendingPool(account) {
  const IlendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );

  const lendingPoolAddress = await IlendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
