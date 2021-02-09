pragma solidity ^0.6.0;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
// import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import './IConditionalTokens.sol';

contract CTWallet {
    IERC20 collateral;
    IConditionalTokens conditionalTokens;

    address oracle;
    bytes32 questionId;
    uint256 numOutcomes;
    bytes32 conditionId;

    mapping(bytes32 => mapping(uint256 => uint256)) public tokenBalance;

    constructor(address _collateral, address _conditionalTokens) public {
        collateral = IERC20(_collateral);
        conditionalTokens = IConditionalTokens(_conditionalTokens);
    }

    function redeemTokens(uint256[] calldata indexSets) external {
        conditionalTokens.redeemPositions(
            collateral,
            bytes32(0), // parentCollectionId, here 0 since top-level bet
            conditionId,
            indexSets
        );
    }

    // to do require sender to be onlyAdmin
    function transferCollateral(address to, uint256 amount) external {
        collateral.transfer(to, amount);
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256(
                    'onERC1155Received(address,address,uint256,uint256,bytes)'
                )
            );
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256(
                    'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)'
                )
            );
    }
}
