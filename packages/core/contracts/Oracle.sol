pragma solidity ^0.6.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IConditionalTokens.sol";

contract Oracle is Ownable {
	IConditionalTokens conditionalTokens;

    constructor(
        address _conditionalTokens
        ) public {
        conditionalTokens = IConditionalTokens(_conditionalTokens);
    }

    event LogReportPayout(bytes32 questionId, uint[] payouts);

    // would need to restrict calling to onlyOwner
    function reportPayout(bytes32 questionId, uint[] memory payouts) public {
    	conditionalTokens.reportPayouts(questionId, payouts);
        emit LogReportPayout(questionId, payouts);
    }
}