import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { deployOrGetAt, getEoaOrPrivateKey } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let eoaAddress: string;
let attacker: Contract;
let setup: Contract; // setup contract
let token: Contract;
let pair: Contract;
let broker: Contract;
let tx: any;

before(async () => {
  eoa = await getEoaOrPrivateKey(
    `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/yield_aggregator/public/contracts/Setup.sol:Setup`,
    `0xe110482bBf51AeB41597ffD10aa3A7bA3d41014b`,
    eoa,
    { value: ethers.utils.parseEther(`100`) }
  );
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(`YieldAggregatorAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`4500`)})
  await tx.wait()

  // PCTF{PR0T3CT_Y0UR_H4RV3ST}
});
