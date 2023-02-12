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
  console.log("deposited");

  // now time to borrow
  /*
   but to borrow we first need to get the userData like how much collateral deposited
   , how much debt is, how much amount can be borrowed
  
  
  */

  const { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );

  // now we need to borrow dai against the available BorrowsEth
  //1. first get dai price per eth

  const daiPricePerEth = await getPrice();

  //2. now calculate the dai per availableBorrowsETH

  const borrowableDai =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPricePerEth.toNumber());

  console.log(borrowableDai, "borrowableDai");
  const borrowableDaiWei = ethers.utils.parseEther(borrowableDai.toString());

  // 3/ its time to borrow Dai
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  await borrowDai(daiTokenAddress, borrowableDaiWei, lendingPool, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

// borrow Dai

async function borrowDai(
  daiTokenAddress,
  borrowedAmount,
  lendingPool,
  account
) {
  const borrowTx = await lendingPool.borrow(
    daiTokenAddress,
    borrowedAmount,
    1,
    0,
    deployer
  );
  await borrowTx.wait(1);
  console.log("dai token borrowed");
}

// get daiPriceperEth

async function getPrice() {
  const priceFeedAddress = "0x773616e4d11a78f511299002da57a0a94577f1f4";
  const priceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    priceFeedAddress
  );

  const daiAmount = (await priceFeed.latestRoundData())[1];
  return daiAmount;
}

// getUserData

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);

  console.log(
    `: totalCollateralETH : ${totalCollateralETH}, totalDebtETH: ${totalDebtETH},availableBorrowsETH: ${availableBorrowsETH} `
  );

  return { totalDebtETH, availableBorrowsETH };
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
