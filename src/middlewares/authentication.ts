import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/userModel';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.SECRET_KEY || 'sua-chave-secreta',
    { expiresIn: '1h' }
  );
};

const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
    return;
  }

  try {
    const userPayload = jwt.verify(
      token,
      process.env.SECRET_KEY || 'sua-chave-secreta'
    ) as JwtPayload;

    const user = await User.findById(userPayload.userId) as IUser | null;
    if (!user) {
      res.status(403).json({ message: "Usuário não encontrado" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Erro ao autenticar o token:", err);
    res.status(403).json({ message: "Token inválido" });
  }
};

export { authenticateToken, generateToken };
