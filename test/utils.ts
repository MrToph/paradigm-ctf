import { Contract, Signer } from "ethers";
import hre, { ethers } from "hardhat";

/**
 * Deploys on local hardhat network.
 * Attaches to an existing contract on ctf network
 */
export const deployOrGetAt = async (
  contract: string,
  address: string,
  eoa: Signer,
  ...deployArgs: any[]
) => {
  const factory = await ethers.getContractFactory(contract, eoa);
  let c: Contract;
  if (hre.network.name === `hardhat`) {
    c = await factory.deploy(...deployArgs);
  } else {
    c = await factory.attach(address).connect(eoa);
  }

  return c;
};

/**
 * Gets a signer according to configured mnemonic on local hardhat network
 * Gets the signer corresponding to private key on ctf network
 */
export const getEoaOrPrivateKey = async (privateKey: string) => {
  if (hre.network.name === `hardhat`) {
    const [eoa] = await ethers.getSigners();
    return eoa;
  } else {
    const eoa = new ethers.Wallet(privateKey, ethers.provider);
    return eoa;
  }
};
