pragma solidity 0.4.24;

import "./Setup.sol";

contract StableSwapAttacker {
    ERC20Like[4] tokens = [
        ERC20Like(0x6B175474E89094C44Da98b954EedeAC495271d0F),
        ERC20Like(0x0000000000085d4780B73119b644AE5ecd22b376),
        ERC20Like(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48),
        ERC20Like(0xdAC17F958D2ee523a2206206994597C13D831ec7)
    ];

    UniswapV2RouterLike router =
        UniswapV2RouterLike(0xf164fC0Ec4E93095b804a4795bBe1e041497b92a);

    constructor() public payable {
        require(msg.value > 0, "!value");
    }

    function buy(uint256[] memory amounts) public returns (uint256) {
        for (uint256 i = 0; i < 4; i++) {
            address[] memory path = new address[](2);
            path[0] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
            path[1] = address(tokens[i]);

            router.swapExactETHForTokens.value(amounts[i])(
                0,
                path,
                address(this),
                uint256(-1)
            );
            tokens[i].transfer(tx.origin, tokens[i].balanceOf(address(this)));
        }
    }

    function() public {
        revert("fallback called");
    }
}
