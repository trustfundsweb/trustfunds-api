// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
  struct Milestone {
    uint256 date;
    uint256 percentage;
    bool reached;
  }

  struct Campaign {
    address payable recipient;
    uint256 targetAmount;
    uint256 deadline;
    uint256 totalRaised;
    bool completed;
    mapping(address => uint256) contributions;
    address[] contributorAddress;
    mapping(address => bool) voted;
    uint256 noOfContributors;
    Milestone[] milestones;
  }

  mapping(uint256 => Campaign) public campaign;
  mapping(string => uint256) public campaignMongoId;
  uint256 public nextCampaignId;

  function createCampaign(
    string memory mongoId,
    address payable _recipient,
    uint256 _targetAmount,
    uint256 _deadline,
    uint256[] memory milestoneDates,
    uint256[] memory milestonePercentages
  ) public {
    require(_targetAmount > 0, "Target amount must be greater than zero");
    require(_deadline > block.timestamp, "Deadline must be in the future");

    Campaign storage newCampaign = campaign[nextCampaignId];
    newCampaign.recipient = _recipient;
    newCampaign.targetAmount = _targetAmount;
    newCampaign.deadline = _deadline;
    newCampaign.totalRaised = 0;
    newCampaign.completed = false;

    for (uint256 i = 0; i < milestoneDates.length; i++) {
      newCampaign.milestones.push(
        Milestone({
          date: milestoneDates[i],
          percentage: milestonePercentages[i],
          reached: false
        })
      );
    }

    campaignMongoId[mongoId] = nextCampaignId;
    nextCampaignId++;
  }

  function addContribution(string memory mongoId) public payable {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp < campaign[campaignId].deadline,
      "Contribution period has ended"
    );

    Campaign storage currentCampaign = campaign[campaignId];
    if (currentCampaign.contributions[msg.sender] == 0) {
      currentCampaign.contributorAddress.push(msg.sender);
      currentCampaign.noOfContributors++;
    }
    currentCampaign.contributions[msg.sender] += msg.value;
    currentCampaign.totalRaised += msg.value;
  }

  function viewContributions(
    string memory mongoId,
    address senderAddress
  ) public view returns (uint256) {
    uint256 campaignId = campaignMongoId[mongoId];
    return campaign[campaignId].contributions[senderAddress];
  }

  function vote(string memory mongoId) public {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      campaign[campaignId].contributions[msg.sender] > 0,
      "You must be a contributor to vote"
    );

    if (campaign[campaignId].voted[msg.sender]) {
      campaign[campaignId].voted[msg.sender] = false;
    } else {
      campaign[campaignId].voted[msg.sender] = true;
    }
  }

  function majorityVote(string memory mongoId) public view returns (bool) {
    uint256 campaignId = campaignMongoId[mongoId];
    uint256 votedCount = 0;

    for (uint256 i = 0; i < campaign[campaignId].noOfContributors; i++) {
      address contributor = campaign[campaignId].contributorAddress[i];
      if (campaign[campaignId].voted[contributor]) {
        votedCount++;
      }
    }

    return (votedCount * 2 > campaign[campaignId].noOfContributors);
  }

  function checkMilestone(string memory mongoId) public payable {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp >= campaign[campaignId].deadline,
      "Deadline has not been reached yet"
    );

    Campaign storage currentCampaign = campaign[campaignId];
    require(!currentCampaign.completed, "Campaign already completed");

    uint256 goalAmount = currentCampaign.targetAmount;
    uint256 totalRaised = currentCampaign.totalRaised;

    if (totalRaised >= goalAmount) {
      for (uint256 i = 0; i < currentCampaign.milestones.length; i++) {
        Milestone storage milestone = currentCampaign.milestones[i];
        if (!milestone.reached && block.timestamp >= milestone.date) {
          milestone.reached = true;
          require(
            majorityVote(mongoId),
            "Majority of the contributors are unhappy with this campaign"
          );
          uint256 amountToTransfer = (goalAmount * milestone.percentage) / 100;
          currentCampaign.recipient.transfer(amountToTransfer);
        }
      }
    } else {
      for (uint256 i = 0; i < currentCampaign.contributorAddress.length; i++) {
        address contributor = currentCampaign.contributorAddress[i];
        uint256 contribution = currentCampaign.contributions[contributor];
        uint256 refundAmount = (contribution * totalRaised) / goalAmount;
        payable(contributor).transfer(refundAmount);
      }
    }

    currentCampaign.completed = true;
  }
}
