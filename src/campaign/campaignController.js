const mongoose = require("mongoose");
const { web3, contractABI } = require("../config/connectWeb3");
const {
  CustomErrorResponse,
  ServerErrorResponse,
  ValidationErrorResponse,
} = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const causesList = require("../campaign/campaignModel");
const campaignUpdationValidation = require("./validations/update-campaign");
const campaignCreationValidation = require("./validations/create-campaign");
const { campaignModel } = require("./campaignModel");
const { StatusCodes } = require("http-status-codes");
const { gasLimit, accountIndex } = require("../config/connectWeb3");

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

    // convert string date to time in seconds
    let dateObj = new Date(body.endDate);
    let numberFormatDate = dateObj.getTime();

    // blockchain part
    if (!web3)
      return new CustomErrorResponse(
        res,
        "Error connecting to web3 network.",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    const accounts = await web3.eth.getAccounts();
    const manager = accounts[accountIndex];
    // Deploy the contract
    const deployedContract = await new web3.eth.Contract(contractABI)
      .deploy({
        data: require("../../web3-trustfunds/build/contracts/Crowdfunding.json")
          .bytecode,
        arguments: [body.goal, numberFormatDate],
      })
      .send({
        from: manager,
        gas: gasLimit,
      });

    if (!deployedContract.options.address)
      return new CustomErrorResponse(
        res,
        "Could not create contract.",
        StatusCodes.BAD_REQUEST
      );
    const newCampaign = new campaignModel({
      ...body,
      story: tempStory,
      creator: user.id,
      contractAddress: deployedContract.options.address,
    });
    await newCampaign.save();

    return new SuccessResponse(
      res,
      "Campaign created successfully and smart contract initiated!",
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
          { story: { $regex: new RegExp(q, "i") } },
        ],
      })
      .exec();

    const data = campaigns.map((campaign) => ({
      name: campaign.name,
      title: campaign.title,
      story: campaign.story,
      goal: campaign.goal,
      endDate: campaign.endDate,
      image: campaign.image,
      causeType: campaign.causeType,
    }));
    return new SuccessResponse(res, "Search results found!", data);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
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
  searchForCampaign,
};
