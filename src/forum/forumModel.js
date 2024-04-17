const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const forumModel = mongoose.model("Forum", forumSchema);

module.exports = forumModel;
