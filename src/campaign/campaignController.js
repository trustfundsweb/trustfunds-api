const getAllCampaigns = async (req, res) => {
  res.status(200).json({ message: "getAllCampaigns" });
};
const getCausesList = async (req, res) => {
  res.status(200).json({ message: "getCausesList" });
};
const createCampaign = async (req, res) => {
  res.status(200).json({ message: "createCampaign" });
};
const getUserCampaigns = async (req, res) => {
  res.status(200).json({ message: "getUserCampaigns" });
};
const getCampaignById = async (req, res) => {
  res.status(200).json({ message: "getCampaignById" });
};
const updateCampaign = async (req, res) => {
  res.status(200).json({ message: "updateCampaign" });
};
const deleteCampaign = async (req, res) => {
  res.status(200).json({ message: "deleteCampaign" });
};
const makeDonation = async (req, res) => {
  res.status(200).json({ message: "makeDonation" });
};

module.exports = {
  getAllCampaigns,
  getCausesList,
  createCampaign,
  getUserCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  makeDonation,
};
