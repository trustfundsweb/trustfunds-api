const register = async () => {
  res.status(200).json({ message: "register!" });
};
const login = async () => {
  res.status(200).json({ message: "login!" });
};
const logout = async () => {
  res.status(200).json({ message: "logout!" });
};

module.exports = {
  register,
  login,
  logout,
};
