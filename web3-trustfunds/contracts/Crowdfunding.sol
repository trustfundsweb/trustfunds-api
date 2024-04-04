pragma solidity >=0.4.22 <0.9.0;

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

    event ContributionReceived(address indexed contributor, uint amount);
    event RefundProcessed(address indexed contributor, uint amount);
    event RequestCreated(uint indexed requestNo, string description, address indexed recipient, uint value);
    event RequestCompleted(uint indexed requestNo, uint value);
    event FundsReleased(uint indexed requestNo, uint value);

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

    function createRequest(string memory _description, address payable _recipient, uint _value) public onlyManager {
        Request storage newRequest = requests[noOfRequests];
        noOfRequests++;
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;

        emit RequestCreated(noOfRequests - 1, _description, _recipient, _value);
    }

    function contribute() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(msg.value >= minContribution, "Minimum contribution required is 100 wei");

        if (contributors[msg.sender] == 0) {
            noOfContributors++;
        }
        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;

        emit ContributionReceived(msg.sender, msg.value);
    }

    function withdrawContribution() public {
        require(block.timestamp < deadline, "Deadline has passed");
        require(contributors[msg.sender] > 0, "You are not a contributor");

        uint amountToWithdraw = contributors[msg.sender];
        contributors[msg.sender] = 0;
        payable(msg.sender).transfer(amountToWithdraw);

        emit RefundProcessed(msg.sender, amountToWithdraw);
    }

    function voteRequest(uint _requestNo) public {
        require(block.timestamp < deadline, "Deadline has passed");
        require(contributors[msg.sender] > 0, "You are not a contributor");
        require(_requestNo < noOfRequests, "Invalid request number");
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.voters[msg.sender] == false, "You have already voted");

        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    function makePayment(uint _requestNo) public onlyManager {
        require(block.timestamp > deadline, "Deadline not reached yet");
        require(raisedAmount >= target, "Target amount is not received");
        require(_requestNo < noOfRequests, "Invalid request number");
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.completed == false, "The request has been completed");
        require(thisRequest.noOfVoters > noOfContributors / 2, "Majority does not support the request");
        require(address(this).balance >= thisRequest.value, "Insufficient contract balance");

        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed = true;

        emit FundsReleased(_requestNo, thisRequest.value);
        emit RequestCompleted(_requestNo, thisRequest.value);
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }
}
