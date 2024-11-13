import { User, Asset } from '../models/userModel';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const findAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw new Error("Erro ao buscar todos os usuários: " + error);
  }
};

export const findUserById = async (userId: string) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw new Error("Erro ao buscar usuário por ID: " + error);
  }
};

export const findUserByToken = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.SECRET_KEY || "sua-chave-secreta"
    ) as DecodedToken;

    return await User.findById(decoded.userId);
  } catch (error) {
    throw new Error("Erro ao buscar usuário pelo token: " + error);
  }
};

export const createAsset = async (
  userId: string,
  nomeAtivo: string,
  quantidadeAtivos: number,
  valorAtivo: number
) => {
  try {
    const newAsset = new Asset({
      userId,
      nomeAtivo,
      quantidadeAtivos,
      valorAtivo,
    });
    return await newAsset.save();
  } catch (error) {
    throw new Error("Erro ao criar um ativo: " + error);
  }
};

export const findAssetsByUserId = async (userId: string) => {
  try {
    return await Asset.find({ userId });
  } catch (error) {
    throw new Error("Erro ao buscar ativos do usuário: " + error);
  }
};
