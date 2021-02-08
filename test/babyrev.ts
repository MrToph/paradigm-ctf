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
    `0x45fa2c04a9c1c431bc4845958e96e5294fc526e46934a30155ae7fc66809b2f4`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/babyrev/public/contracts/Setup.sol:Setup`,
    `0xe77f2d83cE0284AC53A67344982c9B39DcC3EF1B`,
    eoa,
    { value: ethers.utils.parseEther(`50`) }
  );
});

it("prints contract address", async function () {
  const addr = await setup.challenge()
  console.log(`challenge addr = ${addr}`)

  // download using 'npx hardhat get-code <addr> --network ctf'
  // see contracts/babyrev/baby-rev.evm
});
