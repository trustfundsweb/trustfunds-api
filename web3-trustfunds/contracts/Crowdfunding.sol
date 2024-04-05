pragma solidity >=0.4.22 <0.9.0;

contract Crowdfunding {
    struct Request {
        string description;
        address payable recipient;
        uint value;
        bool completed;
    }

    address public creator;
    uint256 public fundingGoal;
    uint256 public totalFunds;
    bool public fundingGoalReached;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public backers;
    mapping(uint256 => Request) public requests;
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
    event MilestoneReached(uint indexed milestoneNo);

    modifier onlyCreator() {
        require(msg.sender == creator, "You are not the creator");
        _;
    }

    modifier goalNotReached() {
        require(!fundingGoalReached, "Funding goal has already been reached");
        _;
    }

    constructor(uint256 _fundingGoal) {
        creator = msg.sender;
        fundingGoal = _fundingGoal;
        minContribution = 100 wei;
        deadline = block.timestamp + 30 days; 
    }

    function contribute() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(msg.value >= minContribution, "Minimum contribution required is 100 wei");

        if (!backers[msg.sender]) {
            noOfContributors++;
        }
        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;
        backers[msg.sender] = true;

        emit ContributionReceived(msg.sender, msg.value);
        checkFundingGoal();
    }

    function checkFundingGoal() internal {
        if (totalFunds >= fundingGoal) {
            fundingGoalReached = true;
        }
    }

    function withdrawFunds() public onlyCreator goalNotReached {
        payable(creator).transfer(totalFunds);
    }

    function createRequest(string memory _description, address payable _recipient, uint _value) public onlyCreator {
        Request storage newRequest = requests[noOfRequests];
        noOfRequests++;
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;

        emit RequestCreated(noOfRequests - 1, _description, _recipient, _value);
    }

    function makePayment(uint _requestNo) public onlyCreator {
        require(fundingGoalReached, "Funding goal not reached");
        require(_requestNo < noOfRequests, "Invalid request number");
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.completed == false, "The request has been completed");
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
