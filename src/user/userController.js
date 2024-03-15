const SuccessResponse = require("../shared/success/successResponse");
const {
  ValidationErrorResponse,
  ServerErrorResponse,
  CustomErrorResponse,
} = require("../shared/error/errorResponse");
const { hashPassword } = require("./utils/auth.utils");
const registerValidation = require("./dto/register-user.dto");
const { StatusCodes } = require("http-status-codes");
const userModel = require("./userModel");

const register = async (req, res) => {
  try {
    const { body } = req;
    // validating user data
    const e = registerValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);
    // checking if user present
    const user = body;
    const isUserPresent = await userModel.findOne({
      email: user.email,
    });
    if (isUserPresent)
      return new CustomErrorResponse(
        res,
        "User already registered!",
        StatusCodes.CONFLICT
      );
    // hashing password & saving user
    const hashedPassword = await hashPassword(user.password);
    const newUser = new userModel({ ...user, password: hashedPassword });
    await newUser.save();
    return new SuccessResponse(res, "User registered successfully");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const login = async (req, res) => {
  res.status(200).json({ message: "login!" });
};

const logout = async (req, res) => {
  res.status(200).json({ message: "logout!" });
};

module.exports = {
  register,
  login,
  logout,
};
