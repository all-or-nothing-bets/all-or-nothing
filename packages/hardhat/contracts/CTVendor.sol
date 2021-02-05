pragma solidity ^0.6.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "contracts/IConditionalTokens.sol";

contract CtVendor {
    IERC20 collateral;
    IConditionalTokens conditionalTokens;
    address public oracle;

    constructor(address _conditionalTokens) public {
        conditionalTokens = IConditionalTokens(_conditionalTokens);
    } 

    function createCondition(bytes32 _questionId, uint _amount, address _oracle) external returns(bytes32){
    conditionalTokens.prepareCondition(
        _oracle,
        _questionId,
        _amount
        );

        bytes32 conditionId = conditionalTokens.getConditionId(
            _oracle,
            _questionId,
            _amount
        );

        return (conditionId);

    }


}