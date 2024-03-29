const mongoose = require("mongoose")
const { CustomErrorResponse, ServerErrorResponse } = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const causesList = require("../campaign/campaignModel");
const { campaignUpdationValidation } = require("./validations/update-campaign");
const { campaignCreationValidation } = require("./validations/create-campaign");
const { campaignModel } = require("./campaignModel");
const { StatusCodes } = require("http-status-codes");

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
  try {
    const { body, user } = req;
    const e = campaignCreationValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);

    let tempStory = body.story;
    tempStory = tempStory.filter((para) => para !== "");

    const newCampaign = new campaignModel({
      ...body,
      story: tempStory,
      creator: user.id,
    });

    await newCampaign.save();
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
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
    return new ServerErrorResponse(res);
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
    return new ServerErrorResponse(res);
  }
};

const updateCampaign = async (req, res) => {
  try {
    const id = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const { body } = req;
    const e = campaignUpdationValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);

    const campaign = await campaignModel.findById(id);
    if (!campaign)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );

    campaign.name = body.name || campaign.name;
    campaign.title = body.title || campaign.title;
    campaign.story = body.story || campaign.story;
    campaign.goal = body.goal || campaign.goal;
    campaign.endDate = body.endDate || campaign.endDate;
    campaign.image = body.image || campaign.image;
    campaign.causeType = body.causeType || campaign.causeType;

    await campaign.save();
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const id = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const campaign = await campaignModel.deleteOne({ _id: id });
    if (campaign.deletedCount === 0)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
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
