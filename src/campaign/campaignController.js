const mongoose = require("mongoose");
const {
  CustomErrorResponse,
  ServerErrorResponse,
  ValidationErrorResponse,
  BadRequestErrorResponse,
} = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const causesList = require("../campaign/campaignModel");
const campaignUpdationValidation = require("./validations/update-campaign");
const campaignCreationValidation = require("./validations/create-campaign");
const { campaignModel } = require("./campaignModel");
const { StatusCodes } = require("http-status-codes");
const { ethToWei } = require("../blockchain/utils/currencyConvert");
const { getMilestoneData } = require("./utils/milestonesData");
const {
  createCampaignFunction,
  getCampaignDetailsFunction,
} = require("../blockchain/crowdfundingFunctions");

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
    return new ServerErrorResponse(res);
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
      contractAddress: "address",
    });

    const saved = await newCampaign.save();

    // convert string date to time in seconds
    let numberFormatDate = new Date(body.endDate).getTime();
    let goalWei = ethToWei(body.goal);
    let mongoId = saved._id;
    let milestones = getMilestoneData(body.milestones);

    const response = await createCampaignFunction(
      mongoId,
      "0x14B8206f5D5028368D193635e70b6f83B2f1dBBd",
      goalWei,
      numberFormatDate,
      milestones
    );
    console.log(response);
    if (!response.success) {
      console.log(response.error);
      return new CustomErrorResponse(
        res,
        "Something went wrong while writing blockchain transaction.",
        StatusCodes.BAD_REQUEST
      );
    }

    return new SuccessResponse(
      res,
      `Campaign created successfully and smart contract initiated! Transaction Hash: ${response.transactionHash}`,
      newCampaign
    );
  } catch (err) {
    console.log(err);
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const getUserCampaigns = async (req, res) => {
  try {
    const { id } = req.user;

    const campaigns = await campaignModel.find({ creator: id });
    if (!campaigns || campaigns.length <= 0)
      return new CustomErrorResponse(
        res,
        "The user has not created any campaigns!",
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

const getUserCampaign = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const data = await campaignModel.findById(id);
    if (!data)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );
    if (data.creator != userId)
      return new CustomErrorResponse(
        res,
        "The campaign you requested was not created by you!",
        StatusCodes.FORBIDDEN
      );

    return new SuccessResponse(res, "Action completed successfully!", data);
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

const getBlockchainCampaignById = async () => {
  const { id } = req.params;
  if (!id) return new ServerErrorResponse(res);
  const response = await getCampaignDetailsFunction(id);
  return new SuccessResponse(
    res,
    "Campaign fetched successfully!",
    response.campaignDetails
  );
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
    return new SuccessResponse(res, "Action completed successfully!", data);
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

const searchForCampaign = async (req, res) => {
  const { q } = req.query;
  console.log(q);
  try {
    const campaigns = await campaignModel
      .find({
        $or: [
          { title: { $regex: new RegExp(q, "i") } },
          { name: { $regex: new RegExp(q, "i") } },
        ],
      })
      .exec();

    return new SuccessResponse(res, "Search results found!", [...campaigns]);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const getMessagesById = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return new BadRequestErrorResponse(res, "Campaign not present!");
    const campaign = await campaignModel
      .findOne({ slug })
      .populate("messages.sender");
    if (!campaign)
      return new CustomErrorResponse(
        res,
        "Campaign Invalid",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(
      res,
      "Action completed successfully!",
      campaign.messages
    );
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

module.exports = {
  getAllCampaigns,
  getCausesList,
  createCampaign,
  getUserCampaigns,
  getUserCampaign,
  getCampaignById,
  getBlockchainCampaignById,
  updateCampaign,
  deleteCampaign,
  makeDonation,
  searchForCampaign,
};
