pragma solidity ^0.6.0;

import "hardhat/console.sol";

import "./Wager.sol";
import "../ConditionalTokens.sol";

contract WagerFactory {

    event WagerCreated(address vestingContractAddress);

	function create(
		address _oracle,
        address _collateral,
        address _conditionalTokens,
        bytes32 _questionId
	)
	public
	returns(address)
	{
		// prepare condition
		ConditionalTokens(_conditionalTokens).prepareCondition(_oracle, _questionId, 2); // NOTE: number of outcomes is hardcoded, should be changed in the future
		// prepare condition id
        bytes32 _conditionId = ConditionalTokens(_conditionalTokens).getConditionId(_oracle, _questionId, 2); // NOTE: same here

		Wager _wager = new Wager(_oracle, _collateral, _conditionalTokens, _questionId, _conditionId);
		// _wager.transferOwnership(address(avatar));

		return address(_wager);
	}

}