import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, findByEmail, updateUserToken } from '../models/userModel';
import { IUser } from '../models/userModel';

interface LoginResponse {
  name: string;
  email: string;
  token: string;
}

export const signup = async (name: string, email: string, password: string): Promise<void> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Senha criptografada:", hashedPassword);
    
    const user: Partial<IUser> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      token: undefined,
    };

    await createUser(user);
  } catch (error) {
    throw new Error("Erro ao cadastrar o usuário: " + error);
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log("Buscando usuário com email:", email.toLowerCase());
    const user = await findByEmail(email.toLowerCase());

    if (!user) {
      console.error("Usuário não encontrado para o email:", email);
      throw new Error("Usuário não encontrado");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Senha inválida para o email:", email);
      throw new Error("Credenciais inválidas");
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.SECRET_KEY || "sua-chave-secreta",
      { expiresIn: "1h" }
    );

    await updateUserToken(user._id, token);

    console.log("Login bem-sucedido para o usuário:", user.name);

    return {
      name: user.name,
      email: user.email,
      token,
    };
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    throw new Error("Erro ao realizar login: " + error);
  }
};

export default {
  signup,
  login,
};
