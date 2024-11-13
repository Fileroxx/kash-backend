import { Request, Response } from 'express';
import authService from '../services/authService';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    await authService.signup(name, email, password);
    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    console.error("Erro ao cadastrar o usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar o usuário" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const userData = await authService.login(email, password);
    res.json(userData);
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    res.status(401).json({ message: "Credenciais inválidas" });
  }
};

export default {
  signup,
  login,
};
