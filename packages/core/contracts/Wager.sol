pragma solidity ^0.6.0;

import "hardhat/console.sol";

import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ConditionalTokens.sol";

library CeilDiv {
    // calculates ceil(x/y)
    function ceildiv(uint x, uint y) internal pure returns (uint) {
        if(x > 0) return ((x - 1) / y) + 1;
        return x / y;
    }
}

contract Wager {
    using SafeMath for uint;
    using CeilDiv  for uint;

    IERC20            public collateral;
    ConditionalTokens public conditionalTokens;

    uint              public endDateTime;

    uint constant ONE = 10**18;
    uint constant fee = 1000; // NOTE: hardcoded now maybe should be changed 

    uint              internal feePoolWeight;

    address 		  public oracle;
    bytes32 		  public questionId;
	bytes32 		  public conditionId;
    bytes32 		  public parentCollectionId;
    bytes32[]         public   conditionIds;

    uint[]            outcomeSlotCounts;
    bytes32[][]       collectionIds;
    uint[]            positionIds;

    uint[] partition = new uint[](2);

    constructor(
    	address _oracle,
        address _collateral,
        address _conditionalTokens,
        bytes32 _questionId,
        uint256 _endDateTime
        ) public {
        collateral = IERC20(_collateral);
        conditionalTokens = ConditionalTokens(_conditionalTokens);
    	oracle = _oracle;
    	questionId = _questionId;
        endDateTime = _endDateTime;

    	partition[0] = 1;
    	partition[1] = 2;

    	parentCollectionId = bytes32(0);
    }

    // TODO: add mechanics for betters to withdraw colateral tokens from pool
    function innitialBet(uint amount, uint outcomeIndex) public {
		// prepare condition
		conditionalTokens.prepareCondition(oracle, questionId, 2); // NOTE: number of outcomes is hardcoded, should be changed in the future
        conditionId = conditionalTokens.getConditionId(oracle, questionId, 2); // NOTE: same here

        collateral.transferFrom(msg.sender, address(this), amount);
    	collateral.approve(address(conditionalTokens), amount);

        conditionalTokens.splitPosition(
            collateral,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );

        // get position IDs
        uint fullIndexSet = (1 << partition.length) - 1;
        uint freeIndexSet = fullIndexSet;

        for (uint i = 0; i < partition.length; i++) {
            uint indexSet = partition[i];
            require(indexSet > 0 && indexSet < fullIndexSet, "got invalid index set");
            require((indexSet & freeIndexSet) == indexSet, "partition not disjoint");
            freeIndexSet ^= indexSet;
            positionIds.push(conditionalTokens.getPositionId(collateral, conditionalTokens.getCollectionId(parentCollectionId, conditionId, indexSet)));
           // amounts[i] = amount;
        }

        uint atomicOutcomeSlotCount = 1;
        outcomeSlotCounts = new uint[](conditionIds.length);
        for (uint i = 0; i < conditionIds.length; i++) {
            uint outcomeSlotCount = conditionalTokens.getOutcomeSlotCount(conditionIds[i]);
            atomicOutcomeSlotCount *= outcomeSlotCount;
            outcomeSlotCounts[i] = outcomeSlotCount;
        }

        conditionalTokens.safeTransferFrom(address(this), msg.sender, positionIds[outcomeIndex], amount, "");
    }
    
    function bet(uint amount, uint outcomeIndex) public {
        require(collateral.transferFrom(msg.sender, address(this), amount), "cost transfer failed");
    	collateral.approve(address(conditionalTokens), amount);

        conditionalTokens.splitPosition(
            collateral,
            parentCollectionId,
            conditionId,
            partition,
            amount
        );

        conditionalTokens.safeTransferFrom(address(this), msg.sender, positionIds[outcomeIndex], amount, "");
    }

    function buy(uint amount, uint outcomeIndex, uint minOutcomeTokensToBuy) public {
        uint outcomeTokensToBuy = calcBuyAmount(amount, outcomeIndex);
        require(outcomeTokensToBuy >= minOutcomeTokensToBuy, "minimum buy amount not reached");

        require(collateral.transferFrom(msg.sender, address(this), amount), "cost transfer failed");

        uint feeAmount = amount.mul(fee) / ONE;
        feePoolWeight = feePoolWeight.add(feeAmount);
        uint amountMinusFees = amount.sub(feeAmount);
        require(collateral.approve(address(conditionalTokens), amountMinusFees), "approval for splits failed");
        splitPositionThroughAllConditions(amountMinusFees);

        conditionalTokens.safeTransferFrom(address(this), msg.sender, positionIds[outcomeIndex], outcomeTokensToBuy, "");
    }

    // helper functions

    function getPoolBalances() private view returns (uint[] memory) {
        address[] memory thises = new address[](positionIds.length);
        for(uint i = 0; i < positionIds.length; i++) {
            thises[i] = address(this);
        }
        return conditionalTokens.balanceOfBatch(thises, positionIds);
    }

    function calcBuyAmount(uint amount, uint outcomeIndex) public view returns (uint) {
        require(outcomeIndex < positionIds.length, "invalid outcome index");

        uint[] memory poolBalances = getPoolBalances();
        uint amountMinusFees = amount.sub(amount.mul(fee) / ONE);
        uint buyTokenPoolBalance = poolBalances[outcomeIndex];
        uint endingOutcomeBalance = buyTokenPoolBalance.mul(ONE);
        for(uint i = 0; i < poolBalances.length; i++) {
            if(i != outcomeIndex) {
                uint poolBalance = poolBalances[i];
                endingOutcomeBalance = endingOutcomeBalance.mul(poolBalance).ceildiv(
                    poolBalance.add(amountMinusFees)
                );
            }
        }
        require(endingOutcomeBalance > 0, "must have non-zero balances");

        return buyTokenPoolBalance.add(amountMinusFees).sub(endingOutcomeBalance.ceildiv(ONE));
    }

    function splitPositionThroughAllConditions(uint amount)
        private
    {
        for(uint i = conditionIds.length - 1; int(i) >= 0; i--) {
            uint[] memory partition = generateBasicPartition(outcomeSlotCounts[i]);
            for(uint j = 0; j < collectionIds[i].length; j++) {
                conditionalTokens.splitPosition(collateral, collectionIds[i][j], conditionIds[i], partition, amount);
            }
        }
    }

    function generateBasicPartition(uint outcomeSlotCount)
        private
        pure
        returns (uint[] memory partition)
    {
        partition = new uint[](outcomeSlotCount);
        for(uint i = 0; i < outcomeSlotCount; i++) {
            partition[i] = 1 << i;
        }
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
        )
        external pure
        returns(bytes4) {
            return this.onERC1155Received.selector;
        }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
        )
        external pure
        returns(bytes4) {
            return this.onERC1155BatchReceived.selector;
        }
}