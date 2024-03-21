const { StatusCodes } = require("http-status-codes");
const SuccessResponse = require("../shared/success/successResponse");
const {
  ValidationErrorResponse,
  ServerErrorResponse,
  CustomErrorResponse,
} = require("../shared/error/errorResponse");
const userModel = require("./userModel");
const {
  hashPassword,
  comparePassword,
  clearCookie,
  attachCookie,
} = require("./utils/auth.utils");
const { createJwt } = require("./utils/jwt.utils");
const registerValidation = require("./dto/register-user.dto");
const loginValidation = require("./dto/login-user.dto");

const register = async (req, res) => {
  try {
    const { body } = req;
    // validating user data
    const e = registerValidation(body);
    console.log(e);
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
    return new SuccessResponse(res, "User registered successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const login = async (req, res) => {
  try {
    const { body } = req;
    // validating user data
    const e = loginValidation(body);
    console.log(e);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);
    // checking if user present
    const { email, password } = body;
    const user = await userModel.findOne({ email });
    if (!user)
      return new CustomErrorResponse(
        "User not registered. Register first!",
        StatusCodes.CONFLICT
      );

    // checking password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return new CustomErrorResponse(
        res,
        "Wrong password or email. Please enter correct credentials!",
        StatusCodes.BAD_REQUEST
      );

    const t = createJwt(
      {
        id: user._id,
      },
      process.env.TOKEN_EXPIRE,
      process.env.TOKEN_SECRET
    );
    attachCookie(t, res, "token");
    return new SuccessResponse(res, "User logged in successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const logout = async (req, res) => {
  clearCookie(res, "token");
  res.status(200).json({ message: "User logged out successfully!" });
};

module.exports = {
  register,
  login,
  logout,
};
