const jwt = require("jsonwebtoken");

class JwtOperation {
  createJwt(payload, expiresIn, key) {
    const token = jwt.sign({ payload }, key, {
      expiresIn: expiresIn,
    });
    return token;
  }

  isTokenValid(token, key) {
    try {
      const response = jwt.verify(token, key);
      return response;
    } catch (err) {
      return false;
    }
  }
}

module.exports = JwtOperation;
