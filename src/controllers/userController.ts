import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.findAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Erro ao obter os usuários: " + error);
    res.status(500).json("Error");
  }
};

export const getUserByToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization;

  try {
    const user = await userService.findUserByToken(token || '');
    if (user) {
      const userData = {
        name: user.name,
        email: user.email,
      };
      res.json(userData);
    } else {
      res.status(404).json("Usuário não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter o usuário por token: " + error);
    res.status(500).json("Erro interno do servidor");
  }
};

export const createAtivo = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const { nomeAtivo, quantidadeAtivos, valorAtivo } = req.body;

  try {
    await userService.createAsset(userId, nomeAtivo, quantidadeAtivos, valorAtivo);
    res.json("Success");
  } catch (error) {
    console.error("Erro ao criar ativo: " + error);
    res.status(500).json("Error");
  }
};

export const getAtivos = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const assets = await userService.findAssetsByUserId(userId);
    res.json(assets);
  } catch (error) {
    console.error("Erro ao obter ativos: " + error);
    res.status(500).json("Error");
  }
};
