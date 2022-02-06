pragma solidity >=0.4.21;

contract Ownable {
    address payable _owner;
    
    constructor() {
        _owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "You are not the owner!");
        _;
    }

    function isOwner() public view returns(bool) {
        return msg.sender == _owner;
    }

    function owner() public view returns(address) {
        return _owner;
    }
}