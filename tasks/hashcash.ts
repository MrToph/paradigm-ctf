import * as fs from "fs";
import hre from "hardhat";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "ethers";
import * as crypto from "crypto";

// https://nakamoto.com/hashcash/
// not working with the challenge, just use brew install hashcash
// for the correct formatting, inspect the server files in dist/eth_challenge_base/eth_sandbox
task("hashcash", "solves hashcash challenges")
  .addPositionalParam("prefix", "The challenge prefix")
  .setAction(async function (taskArgs, hre, runSuper) {
    let { prefix } = taskArgs;
    let result:any = ``;
    let preimage = ``;
    const target = "0".repeat(6); // 6 hex chars = 24 bits
    let counter = 0;
    let date = Date.now() + 5 * 60 * 1000
    while (true) {
      let sha = crypto.createHash("sha1");

      // needs to be version 1, see eth_challenge_base
      preimage = `1:24:skipped:${prefix}:${counter}`;
      sha.update(preimage);
      result = sha.digest(`hex`);

      if (result.startsWith(target)) {
        break;
      }

      counter++;
      if (counter % 1e6 === 0) {
        console.log(`${counter} runs`);
      }
    }

    console.log(result);
    console.log(preimage);
  });
