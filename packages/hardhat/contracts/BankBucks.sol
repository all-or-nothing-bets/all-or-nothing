pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BankBucks is ERC20{
    constructor(address to) ERC20("BankBucks", "BKB") public {
        _mint(to, 40000 * 10 **18);
        _mint(msg.sender, 60000 * 10 **18);
    }
}
