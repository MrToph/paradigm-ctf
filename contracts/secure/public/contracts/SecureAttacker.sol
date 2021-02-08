pragma solidity 0.5.12;

import "./Setup.sol";
import "hardhat/console.sol";

contract SecureAttacker {
    Setup public setup;

    constructor(Setup _setup) public {
        setup = _setup;
    }

    function attack() external payable {
        // solution just checks if setup contract has 50 WETH
        // so just send it 50 WETH, lul

        setup.WETH().deposit.value(msg.value)();
        setup.WETH().transfer(address(setup), setup.WANT());

        require(setup.isSolved(), "!solved");
    }
}
