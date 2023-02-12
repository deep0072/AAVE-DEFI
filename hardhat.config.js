require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const Etherscan_API_KEY = process.env.Etherscan_API_KEY;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31377,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
    },
  },

  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      goerli: Etherscan_API_KEY,
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },

      {
        version: "0.4.19",
      },
      {
        version: "0.6.12",
      },
    ],
  },

  namedAccounts: {
    deployer: {
      default: 0,
    }, //this is the index of pvt key that is mentioned in above given accounts array
    user: {
      default: 1,
    },
  },
};
