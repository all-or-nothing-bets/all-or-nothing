pragma solidity ^0.6.0;

import './Wager.sol';

contract WagerFactory {
    address public admin;
    address public oracle;
    address public conditionalTokens;
    mapping(bytes32 => address) private wagers;
    address[] private wagerAddresses; // we need this so we can enumerate addresses

    event WagerCreated(address wagerContractAddress);

    modifier onlyAdmin {
        require(msg.sender == admin, 'Sender not authorized');
        _;
    }

    constructor() public {
        admin = msg.sender;
    }

    function setOracle(address _oracle) external onlyAdmin {
        oracle = _oracle;
    }

    function setConditionalTokens(address _conditionalTokens)
        external
        onlyAdmin
    {
        conditionalTokens = _conditionalTokens;
    }

    function create(
        address _collateral,
        bytes32 _questionId,
        uint256 _endDateTime
    ) public returns (address) {
        Wager _wager =
            new Wager(
                oracle,
                _collateral,
                conditionalTokens,
                _questionId,
                _endDateTime
            );
        // _wager.transferOwnership(address(avatar));
        wagers[_questionId] = address(_wager);
        wagerAddresses.push(address(_wager));
        emit WagerCreated(address(_wager));
        return address(_wager);
    }
}
