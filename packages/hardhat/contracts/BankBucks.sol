pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BankBucks is ERC20{
    constructor() ERC20("BankBucks", "BKB") public {
        _mint(msg.sender,1000 * 10 **18);
    }
}


