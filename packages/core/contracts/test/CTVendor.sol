pragma solidity ^0.6.0;

import "hardhat/console.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "../IConditionalTokens.sol";

contract CTVendor {
    IERC20 collateral;
    IConditionalTokens conditionalTokens;

    address oracle;
    bytes32 questionId;
    uint numOutcomes;
    bytes32 public conditionId;

    mapping(bytes32 => mapping(uint => uint)) public tokenBalance;

    event LogCollateralBalance(address from, uint256 balance);
    event LogAmount(uint amount);

    constructor(
        address _collateral,
        address _conditionalTokens
        ) public {
        collateral = IERC20(_collateral);
        conditionalTokens = IConditionalTokens(_conditionalTokens);
    }

    // to do: add modifier to control who can view
    function getConditionId() external view returns (bytes32) {
        return conditionId;
    }

    function createCondition(
        address _oracle,
        bytes32 _questionId,
        uint _numOutcomes
        ) external {

        conditionalTokens.prepareCondition(
            _oracle,
            _questionId,
            _numOutcomes
        );

        oracle = _oracle;
        questionId = _questionId;
        numOutcomes = _numOutcomes;
        conditionId = conditionalTokens.getConditionId(
            _oracle,
            _questionId,
            _numOutcomes
        );
    }

    function splitCollateral(
        // bytes32 parentCollectionId,
        // uint[] calldata partition,
        uint amount
        ) external {

        collateral.approve(address(conditionalTokens), amount);

        emit LogAmount(amount);
        emit LogCollateralBalance(address(this), collateral.balanceOf(msg.sender));

        uint[] memory partition = new uint[](2); 
        partition[0] = 1;
        partition[1] = 2;

        conditionalTokens.splitPosition(
            collateral,
            bytes32(0),  // parentCollectionId, here 0 since top-level bet
            conditionId,
            partition,
            amount
        );

        tokenBalance[questionId][0] = amount;
        tokenBalance[questionId][1] = amount;
    }

    // to do: add admin and control for onlyAdmin
    // to do: add check that tokenBalance is sufficient
    function transferTokens(
        uint indexSet,
        address to, // need to implement ERC1155TokenReceiver if address of smart contract
        uint amount
    ) 
    //setting to internal
    internal{
        
        bytes32 collectionId = conditionalTokens.getCollectionId(
            bytes32(0),  // parentCollectionId, here 0 since top-level bet
            conditionId,
            indexSet
        );
    
        uint positionId = conditionalTokens.getPositionId(
            collateral,
            collectionId
        );

        conditionalTokens.safeTransferFrom(
            address(this),
            to,
            positionId,  // identifies conditional token
            amount,
            ""
        );
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
        // return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));

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
        // return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));

    
    // buy conditional tokens with users ERC 20 and send CTs (complete set) back to user. 
    function buyConditionalTokens (uint _amount, uint _indexSet) external {
        
        //send ERC20 to CTVendor
        address bettor;
        bettor = msg.sender;
        address contractAddress;
        contractAddress = address(this);
        //require allowence is set. 
        //require(collateral.allowance(bettor, contractAddress) >= _amount, "Allowence too low");
        //collateral.transfer(contractAddress, _amount);
        collateral.transferFrom(bettor,contractAddress,_amount);

        //Test one, can a bettor increase the CT tokens balance via this function? Yes!
        //split collateral

        //approve Ct contract spending ERC20 from CTvendor
        collateral.approve(address(conditionalTokens), _amount);
        emit LogAmount(_amount);
        emit LogCollateralBalance(address(this), collateral.balanceOf(msg.sender));

        uint[] memory partition = new uint[](2); 
        partition[0] = 1;
        partition[1] = 2;

        conditionalTokens.splitPosition(
            collateral,
            bytes32(0),  // parentCollectionId, here 0 since top-level bet
            conditionId,
            partition,
            _amount
        );

        tokenBalance[questionId][0] = _amount;
        tokenBalance[questionId][1] = _amount;
        //send back to bettor
        transferTokens(_indexSet,bettor,_amount);
        //update token balances
        tokenBalance[questionId][_indexSet] = tokenBalance[questionId][_indexSet] - _amount;
    }
    
    
    
    fallback() external payable {
    }
}