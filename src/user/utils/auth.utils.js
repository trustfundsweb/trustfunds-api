const bcrypt = require("bcrypt");

const attachCookie = (token, res, name) => {
  res.cookie(name, token, {
    httpOnly: process.env.NODE_ENV === this.production ? true : false,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: true,
    signed: false,
    sameSite: "lax",
    domain: process.env.PARENT_DOMAIN,
  });
};

const clearCookie = (res, name) => {
  res.clearCookie(name, {
    path: "/",
    domain: process.env.PARENT_DOMAIN,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  attachCookie,
  clearCookie,
  hashPassword,
  comparePassword,
};
