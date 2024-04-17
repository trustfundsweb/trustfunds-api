const {
  CustomErrorResponse,
  ServerErrorResponse,
  BadRequestErrorResponse,
} = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const { forumModel } = require("./forumModel");
const { StatusCodes } = require("http-status-codes");

const getAllMessages = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const messages = await forumModel.findById(id);
    if (!messages || messages.length <= 0)
      return new CustomErrorResponse(
        res,
        "No messages present.",
        StatusCodes.BAD_REQUEST
      );
    return new SuccessResponse(res, "Messages fetched successfully!", messages);
  } catch (err) {
    console.error(err.message, err.status);
    return new ServerErrorResponse(
      res,
      "Internal Server Error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sender, date, message } = req.body;
    const { id } = req.params;

    if (!id) {
      return new BadRequestErrorResponse(res, "Campaign id not present!");
    }

    if (!sender || !date || !message) {
      return new BadRequestErrorResponse(
        res,
        "Sender, date, or message missing!"
      );
    }

    const newMessage = new forumModel({
      sender,
      date,
      message,
    });

    const savedMessage = await newMessage.save();

    return new SuccessResponse(res, "Message sent successfully!", savedMessage);
  } catch (err) {
    console.error(err.message, err.status);
    return new ServerErrorResponse(
      res,
      "Internal Server Error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  getAllMessages,
  sendMessage,
};
