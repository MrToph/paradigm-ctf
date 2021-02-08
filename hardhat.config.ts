import dotenv from "dotenv";
dotenv.config(); // load env vars from .env
import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@tenderly/hardhat-tenderly";
import "./tasks/index";

const { ARCHIVE_URL } = process.env;

if (!ARCHIVE_URL)
  throw new Error(
    `ARCHIVE_URL env var not set. Copy .env.template to .env and set the env var`
  );

const accounts = {
  // derive accounts from mnemonic, see tasks/create-key
  mnemonic: `test test test test test test test test test test test junk`,
};

const URL = `http://104.154.28.25:8545/fddce140-9b2c-45c9-849f-053955b0dad9`;

// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.4.24" },
      { version: "0.4.16" },
      { version: "0.5.12" },
      { version: "0.6.0" },
      { version: "0.6.12" },
      { version: "0.7.0" },
      { version: "0.8.0" },
    ],
  },
  networks: {
    ctf: {
      url: URL,
      accounts,
    },
    hardhat: {
      accounts,
      loggingEnabled: false,
      forking: {
        url: ARCHIVE_URL, // https://eth-mainnet.alchemyapi.io/v2/SECRET`,
        blockNumber: 11800000
      },
    },
    // local: {
    //   url: "http://127.0.0.1:8545",
    // },
  },
  mocha: {
    timeout: 300 * 1e3,
  },
  // tenderly: {
  //   username: process.env.TENDERLY_USERNAME!,
  //   project: process.env.TENDERLY_PROJECT!,
  // },
};

export default config;
