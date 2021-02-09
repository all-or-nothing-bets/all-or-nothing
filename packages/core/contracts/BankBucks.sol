pragma solidity >=0.6.0 <0.7.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BankBucks is ERC20 {
    constructor() public ERC20('BankBucks', 'BKB') {
        // _mint(to, 40000 * 10 **18);
        _mint(msg.sender, 1000 * 10**18);
    }
}
