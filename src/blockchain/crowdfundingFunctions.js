import { contract, senderAddress } from "./connectWeb3";

// Function to create a campaign
async function createCampaign(
  mongoId,
  recipient,
  targetAmount,
  deadline,
  milestones
) {
  try {
    const result = await contract.methods
      .createCampaign(
        mongoId,
        recipient,
        targetAmount,
        deadline,
        milestones.deadlines,
        milestones.completionPercentages
      )
      .send({ from: senderAddress });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to contribute to a campaign
async function contributeToCampaign(mongoId, value) {
  try {
    const result = await contract.methods
      .contributeToCampaign(mongoId)
      .send({ value: value, from: senderAddress });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to vote on a campaign
async function vote(mongoId) {
  try {
    const result = await contract.methods
      .vote(mongoId)
      .send({ from: senderAddress });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to finalize milestone and disburse funds
async function finalizeMilestoneAndDisburseFunds(mongoId) {
  try {
    const result = await contract.methods
      .finalizeMilestoneAndDisburseFunds(mongoId)
      .send({ from: senderAddress });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Example usage:
// const targetAmount = 1000000000000000000; // 1 ETH in wei
// const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in Unix timestamp
// const milestones = {
// deadlines: [deadline + 3600, deadline + 7200], // Two hours and three hours from now
// completionPercentages: [50, 100] // 50% and 100% completion
// };

module.exports = {
  createCampaign,
  contributeToCampaign,
  vote,
  finalizeMilestoneAndDisburseFunds,
};
