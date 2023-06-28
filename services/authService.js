const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const signup = (name, email, password) => {
  return userModel.createUser(name, email, password);
};

const login = (email, password) => {
  return userModel.findByEmailAndPassword(email, password)
    .then((user) => {
      const token = jwt.sign(
        { name: user.name, userId: user.id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      return token;
    });
};

module.exports = {
  signup,
  login,
};