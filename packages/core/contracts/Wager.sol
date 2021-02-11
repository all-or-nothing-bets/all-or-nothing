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

    uint              internal feePoolWeight;

    address 		  public oracle;
    bytes32 		  public questionId;
	bytes32 		  public conditionId;
    bytes32 		  public parentCollectionId;
    bytes32[]         public  conditionIds;

    uint[]            outcomeSlotCounts;
    bytes32[][]       collectionIds;
    uint[]            positionIds;

    uint[] partition = new uint[](2);
    uint public initBet = 0;

    address[] initBettors = new address[](2);
    uint[]    initBets = new uint[](2);

    uint[] outcomes;

    bool resolved;
    uint resolvedWith;

    uint tokensBought = 0;

    modifier notResolved() {
        require(!resolved,                      "wager contract is not resolved");
        _;
    }

    modifier isResolved() {
        require(resolved,                       "wager contract is resolved");
        _;
    }

    constructor(
    	address _oracle,
        address _collateral,
        address _conditionalTokens,
        bytes32 _questionId,
        uint256 _endDateTime // UTC timestamp
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
    function resolve(uint _resolvedWith, uint[] memory _outcomes) public notResolved {
        // TODO: add security checks(*payoutNumerators*//*payoutDenominator*)
        resolved = true;
        resolvedWith = _resolvedWith;
        outcomes = _outcomes;
    }

    function getCollateral() external view returns (address) {
        return address(collateral);
    }

    function getEndDateTime() external view returns (uint256) {
        return endDateTime;
    }

    // TODO: add mechanics for betters to withdraw colateral tokens from pool
    function initialBet(uint amount, uint outcomeIndex) public notResolved {
        // update init bettors data
        initBettors[0] = msg.sender;
        initBets[0] = outcomeIndex;
        initBet = initBet.add(amount);

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

    function bet(uint amount, uint outcomeIndex) public notResolved {
        require(initBets[1] >= 0, 'after 1st step only');

        // update init bettors data
        if (initBettors[1] == address(0)){
            require(outcomeIndex != initBets[0], 'should be different bets');
            initBettors[1] = msg.sender;
            initBets[1] = outcomeIndex;
            initBet = initBet.add(amount);
        }

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

    function buy(uint amount, uint outcomeIndex/) public notResolved {
        require(collateral.transferFrom(msg.sender, address(this), amount), "cost transfer failed");

        require(collateral.approve(address(conditionalTokens), amount), "approval for splits failed");

        tokensBought = tokensBought.add(amount);

        conditionalTokens.safeTransferFrom(address(this), msg.sender, positionIds[outcomeIndex], amount, "");
    }

    function withdraw() public isResolved {
        uint sendersTokens = conditionalTokens.balanceOf(msg.sender, positionIds[resolvedWith]);
        conditionalTokens.safeTransferFrom(msg.sender, address(this), positionIds[resolvedWith], sendersTokens, "");

        conditionalTokens.redeemPositions(
            collateral,
            bytes32(0),  // parentCollectionId, here 0 since top-level bet
            conditionId,
            outcomes
            );

        if (msg.sender == initBettors[resolvedWith]){
                collateral.transfer(msg.sender, initBet);  
                initBet = 0;
        } else {
            collateral.transfer(msg.sender, sendersTokens); 
        }
    }

    // helper functions

    function getPoolBalances() private view returns (uint[] memory) {
        address[] memory thises = new address[](positionIds.length);
        for(uint i = 0; i < positionIds.length; i++) {
            thises[i] = address(this);
        }
        return conditionalTokens.balanceOfBatch(thises, positionIds);
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