pragma solidity >=0.4.22 <0.9.0;
// SPDX-License-Identifier: MIT

contract Crowdfunding {
    struct Request {
        string description;
        address payable recipient;
        uint value;
        bool completed;
        uint noOfVoters;
        mapping(address => bool) voters;
    }

    mapping(address => uint) public contributors;
    mapping(uint => Request) public requests;
    address public manager;
    uint public target;
    uint public noOfRequests;
    uint public noOfContributors;
    uint public deadline;
    uint public raisedAmount;
    uint public minContribution;

    constructor(uint _target, uint _deadline) {
        target = _target;
        deadline = block.timestamp + _deadline;
        minContribution = 100 wei;
        manager = msg.sender;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }

    function createRequests(string calldata _description, address payable _recipient, uint _value) public onlyManager {
        Request storage newRequest = requests[noOfRequests];
        noOfRequests++;
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;
    }

    function contribution() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(msg.value >= minContribution, "Minimum contribution required is 100 wei");

        if (contributors[msg.sender] == 0) {
            noOfContributors++;
        }
        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    function refund() public {
        require(block.timestamp > deadline && raisedAmount < target, "You are not eligible for a refund");
        require(contributors[msg.sender] > 0, "You are not a contributor");
        payable(msg.sender).transfer(contributors[msg.sender]);
        contributors[msg.sender] = 0;
    }

    function voteRequest(uint _requestNo) public {
        require(contributors[msg.sender] > 0, "You are not a contributor");
        require(_requestNo < noOfRequests, "Invalid request number");
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.voters[msg.sender] == false, "You have already voted");
        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    function makePayment(uint _requestNo) public onlyManager {
        require(raisedAmount >= target, "Target amount is not received");
        require(_requestNo < noOfRequests, "Invalid request number");
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.completed == false, "The request has been completed");
        require(thisRequest.noOfVoters > noOfContributors / 2, "Majority does not support the request");
        require(address(this).balance >= thisRequest.value, "Insufficient contract balance");
        
        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed = true;
    }
}

