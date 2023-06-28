const userService = require("../services/userService");

const getUsers = (req, res) => {
  userService.getUsers()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

const getUserById = (req, res) => {
  const userId = req.params.id;
  userService.getUserById(userId)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json("User not found");
      }
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

const createAtivo = (req, res) => {
  const userId = req.params.id;
  const { nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;
  userService.createAtivo(userId, nomeAtivo, quantidadeAtivos, valorAtivo)
    .then(() => {
      res.json("Success");
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

const getAtivos = (req, res) => {
  const userId = req.params.id;
  userService.getAtivos(userId)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error("Erro ao executar a consulta: " + error.stack);
      res.status(500).json("Error");
    });
};

module.exports = {
  getUsers,
  getUserById,
  createAtivo,
  getAtivos,
};
