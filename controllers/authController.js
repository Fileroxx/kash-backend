const authService = require("../services/authService");


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
    .then((token, name, email) => {
      res.json({ token, name, email });
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(401).json("Credenciais inválidas");
    });
};

module.exports = {
  signup,
  login,
};
