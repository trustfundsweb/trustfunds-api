const { CustomErrorResponse } = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const causesList = require("../campaign/campaignModel");

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await campaignModel.find();
    if (!campaigns || campaigns.length <= 0)
      return new CustomErrorResponse(
        res,
        "No campaigns present. Create one!",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(
      res,
      "Campaigns fetched successfully!",
      campaigns
    );
  } catch (err) {
    console.error(err.message, err.status);
  }
};

const getCausesList = async (req, res) => {
  return new SuccessResponse(res, "Campaign causes fetched!", causesList);
};

const createCampaign = async (req, res) => {
  res.status(200).json({ message: "createCampaign" });
};

const getUserCampaigns = async (req, res) => {
  try {
    const { id } = req.user;
    if (!mongoose.isValidObjectId(id))
      return new CustomErrorResponse(
        res,
        "Invalid user ID!",
        StatusCodes.BAD_REQUEST
      );

    const campaigns = await campaignModel.find({ creator: id });
    if (!campaigns || campaigns.length <= 0)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(
      res,
      "Campaigns fetched successfully!",
      campaigns
    );
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    if (!mongoose.isValidObjectId(id))
      return new CustomErrorResponse(
        res,
        "Invalid campaign ID",
        StatusCodes.BAD_REQUEST
      );

    const data = await campaignModel.findById(id);
    if (!data)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(res, "Action completed successfully!", data);
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
  }
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
