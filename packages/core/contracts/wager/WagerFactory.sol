pragma solidity ^0.6.0;

import "hardhat/console.sol";

import "./Wager.sol";
import "../ConditionalTokens.sol";

contract WagerFactory {

    event WagerCreated(address wagerContractAddress);

	function create(
		address _oracle,
        address _collateral,
        address _conditionalTokens,
        bytes32 _questionId
	)
	public
	returns(address)
	{
		Wager _wager = new Wager(_oracle, _collateral, _conditionalTokens, _questionId);
		// _wager.transferOwnership(address(avatar));
		emit WagerCreated(address(_wager));

		return address(_wager);
	}
}