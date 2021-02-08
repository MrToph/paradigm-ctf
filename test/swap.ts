import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

let accounts: Signer[];
let eoa: Signer;
let eoaAddress: string;
let attacker: Contract;
let setup: Contract; // setup contract
let swap: Contract; // setup contract
let uniRouter: Contract; // setup contract
let tx: any;
let tokens: Contract[];

before(async () => {
  eoa = new ethers.Wallet(
    `0xf48b6bd19d2cb738d9028540da612cfd73c071324e81a3894645bbefc684f80c`,
    ethers.provider
  );
  eoaAddress = await eoa.getAddress();

  setup = await ethers.getContractAt(
    `contracts/swap/public/contracts/Setup.sol:Setup`,
    `0x98D7fa8AC6Ee7918A5B02348C7ac90c99D114488`
  );
  uniRouter = await ethers.getContractAt(
    `UniswapV2RouterLike`,
    `0xf164fC0Ec4E93095b804a4795bBe1e041497b92a`
  );
  swap = await ethers.getContractAt(`StableSwap`, await setup.swap());

  tokens = await Promise.all([
    ethers.getContractAt(
      `contracts/swap/public/contracts/ERC20.sol:ERC20Like`,
      `0x6B175474E89094C44Da98b954EedeAC495271d0F`
    ),
    ethers.getContractAt(
      `contracts/swap/public/contracts/ERC20.sol:ERC20Like`,
      `0x0000000000085d4780B73119b644AE5ecd22b376`
    ),
    ethers.getContractAt(
      `contracts/swap/public/contracts/ERC20.sol:ERC20Like`,
      `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
    ),
    ethers.getContractAt(
      `contracts/swap/public/contracts/ERC20.sol:ERC20Like`,
      `0xdAC17F958D2ee523a2206206994597C13D831ec7`
    ),
  ]);
  tokens = tokens.map((t) => t.connect(eoa));

  const attackerFactory = await ethers.getContractFactory(`StableSwapAttacker`);
  // attacker = await attackerFactory
  //   .connect(eoa)
  //   .deploy({ value: (await eoa.getBalance()).div(10) });
  attacker = attackerFactory
    .attach(`0x5441453c73261472f3b2327Dff0d7856677853CC`)
    .connect(eoa);
  console.log(`attacker address`, attacker.address);
});

it.skip("buys funds", async function () {
  const totalAmount = ethers.utils.parseEther(`500`);
  const amounts = Array.from({ length: 4 }, () => totalAmount.div(4));
  tx = await attacker.buy(amounts);
  await tx.wait();
});

it("sends funds to attacker funds", async function () {
  for (const token of tokens) {
    console.log(await token.symbol());
    const decimals = await token.decimals();
    const amount = ethers.utils.parseUnits(`100000`, decimals);
    tx = await token.transfer(attacker.address, amount);
    await tx.wait();
    console.log(
      `\tSend`,
      ethers.utils.formatUnits(amount, decimals),
      `\tBalance`,
      ethers.utils.formatUnits(await token.balanceOf(attacker.address), decimals)
    );
  }
});

it("gather info", async function () {
  const myEthBalance = await eoa.getBalance();
  console.log(ethers.utils.formatEther(myEthBalance));

  for (const token of tokens) {
    console.log(
      await token.name(),
      await token.symbol(),
      await token.decimals(),
      ethers.utils.formatEther(await token.totalSupply())
    );
    console.log(
      `\tBalance`,
      ethers.utils.formatEther(await token.balanceOf(eoaAddress))
    );
  }
});
