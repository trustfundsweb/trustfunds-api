const { StatusCodes } = require("http-status-codes");
const CustomError = require("../shared/error/customError");
const JwtOperations = require("../user/utils/jwt.utils");

const verifyToken = (req, res, next) => {
  let temp = req.headers?.cookie;
  let token = temp?.split("token=")[1];
  if (!token) {
    throw new CustomError(
      "Token not present. Please login again!",
      StatusCodes.UNAUTHORIZED
    );
  }

  const jwtOperations = new JwtOperations();
  try {
    const tokenResponse = jwtOperations.isTokenValid(
      token,
      process.env.TOKEN_SECRET
    );
    if (!tokenResponse) {
      throw new CustomError(
        "Invalid token. Please login again!",
        StatusCodes.UNAUTHORIZED
      );
    }
    const id = tokenResponse.payload.id;
    req.user = { id };
    return next();
  } catch (err) {
    throw new CustomError(err.message, StatusCodes.FORBIDDEN);
  }
};

module.exports = verifyToken;
