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

    function createCondition(bytes32 _questionId, uint _amount, address _oracle) external {
    //create condition
    conditionalTokens.prepareCondition(
        _oracle,
        _questionId,
        _amount
        );
    }


    //split a condition with collateral
    function splitCollateral(bytes32 _conditionId, IERC20 _collateral, bytes32 _parentCollectionId, uint[] calldata _partition, uint _amount ) external {
        //approve collateral
        _collateral.approve(address(conditionalTokens), _amount);

        //split position
        conditionalTokens.splitPosition(
            _collateral,
            _parentCollectionId,
            _conditionId,
            _partition,
            _amount
        );

    

    }


    //fallback
     fallback() external payable {
     }

}