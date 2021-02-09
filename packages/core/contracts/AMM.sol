pragma solidity ^0.6.0;

import 'hardhat/console.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
// import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import './ConditionalTokens.sol';

contract AMM {
    IERC20 collateral;
    ConditionalTokens conditionalTokens;

    constructor(address _collateral, address _conditionalTokens) public {
        collateral = IERC20(_collateral);
        conditionalTokens = ConditionalTokens(_conditionalTokens);
    }

    function createBet(
        address oracle,
        bytes32 questionId,
        uint256 numOutcomes,
        uint256 amount
    ) public {
        conditionalTokens.prepareCondition(oracle, questionId, numOutcomes);

        bytes32 conditionId =
            conditionalTokens.getConditionId(oracle, questionId, numOutcomes);

        // transfer collateral to AMM address
        collateral.transferFrom(msg.sender, address(this), amount);
        // approve collateral to be spent by conditionalTokens
        collateral.approve(address(conditionalTokens), amount);

        uint256[] memory partition = new uint256[](2);
        partition[0] = 1;
        partition[1] = 2;

        conditionalTokens.splitPosition(
            collateral,
            bytes32(0),
            conditionId,
            partition,
            amount
        );
    }

    function bet(uint256 betId, uint256 amount) public {
        collateral.transferFrom(msg.sender, address(this), amount);
        conditionalTokens.safeTransferFrom(
            address(this),
            msg.sender,
            betId,
            amount,
            ''
        );
    }

    function redeemTokens(bytes32 conditionId, uint256[] calldata indexSets)
        external
    {
        conditionalTokens.redeemPositions(
            collateral,
            bytes32(0), // parentCollectionId, here 0 since top-level bet
            conditionId,
            indexSets
        );
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    fallback() external payable {}
}
