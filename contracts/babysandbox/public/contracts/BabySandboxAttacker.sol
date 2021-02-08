pragma solidity 0.7.0;
import "hardhat/console.sol";

// https://docs.soliditylang.org/en/v0.5.3/assembly.html
// call(g, a, v, in, insize, out, outsize)	 	F	call contract at address a with input mem[in…(in+insize)) providing g gas and v wei and output area mem[out…(out+outsize)) returning 0 on error (eg. out of gas) and 1 on success
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-214.md
contract BabySandboxAttacker {
    uint256 flag = 1;
    // an event that signifies that the state is no longer unchanged
    // event StateUnchanged(bool);

    // a function that changes state by emitting an (empty) event
    function changeState() public payable {
        console.log("in state change");
        // emit StateUnchanged(false);
    }

    fallback() external payable {
        // uint256 size;
        assembly {
            // size := returndatasize()
            // log0(0x00, 0x00)
        }

        console.log(gasleft());
        console.logAddress(address(this));


        // why doesn't this work even with more gas available?
        (bool success, ) = address(this).call(abi.encodeWithSignature("changeState()"));
        console.log("SUCC = %s", success);

        // flag = 0;
        // if (flag == 0) {
        //     console.log("success");
        //     // selfdestruct(address(0x00));
        // } else {
        //     console.log("!success");
        // }
    }
}
