const express = require("express");
const router = express.Router();
const {
  getAllCampaigns,
  getCausesList,
  createCampaign,
  getUserCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  makeDonation,
} = require("./campaignController");
const verifyToken = require("../middleware/verifyToken");

router.route("/all").get(getAllCampaigns);
router.route("/causes").get(getCausesList);
router.route("/create").post(verifyToken, createCampaign);
router.route("/user").get(verifyToken, getUserCampaigns);
router.route("/:id").get(getCampaignById);
router.route("/:id").put(verifyToken, updateCampaign);
router.route("/:id").delete(verifyToken, deleteCampaign);
router.route("/:id/donate").post(verifyToken, makeDonation);

module.exports = router;