const authService = require("../services/authService");
const userModel = require("../models/userModel");

const signup = (req, res) => {
  const { name, email, password } = req.body;
  authService.signup(name, email, password)
    .then(() => {
      res.json("Success");
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.json("Error");
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  authService.login(email, password)
    .then((userData) => {
      const { token, name, email } = userData;

      // Atualiza o token no usuário
      userModel.updateUserToken(userData.id, token)
        .then(() => {
          res.json({ token, name, email });
        })
        .catch((error) => {
          console.error("Erro ao atualizar o token do usuário:", error);
          res.status(500).json("Erro interno do servidor");
        });
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: ", error);
      res.status(401).json("Credenciais inválidas");
    });
};
module.exports = {
  signup,
  login,
};
