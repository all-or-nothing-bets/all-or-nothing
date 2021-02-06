pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BankBucksVendor {
    IERC20 bankBucks;

    constructor(address tokenAddress) public {
        bankBucks = IERC20(tokenAddress);
    }

    function buyToken() public payable {
        require(bankBucks.transfer(msg.sender, msg.value), "TRASFER FAILS");
    }
}