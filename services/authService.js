const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const signup = (name, email, password) => {
  return new Promise((resolve, reject) => {
    const user = {
      name,
      email,
      password,
      token: null, // Defina o token inicialmente como null
    };

    userModel.createUser(user)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

const login = (email, password) => {
  return new Promise((resolve, reject) => {
    userModel.findByEmailAndPassword(email, password)
      .then((user) => {
        if (!user) {
          reject(new Error("Usuário não encontrado"));
          return;
        }

        if (user.password !== password) {
          reject(new Error("Credenciais inválidas"));
          return;
        }

        const token = jwt.sign(
          { name: user.name, userId: user.id, email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        // Atualiza o token no usuário
        userModel.updateUserToken(user.id, token)
          .then(() => {
            const userData = {
              name: user.name,
              email: user.email,
              token: token,
            };

            resolve(userData);
          })
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });
};

module.exports = {
  signup,
  login,
};
