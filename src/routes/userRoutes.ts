import express from 'express';

import * as userController from '../controllers/userController';
import { authenticateToken } from '../middlewares/authentication';

const userRouter = express.Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/me", authenticateToken, userController.getUserByToken);
userRouter.post("/ativos", authenticateToken, userController.createAtivo);
userRouter.get("/ativos", authenticateToken, userController.getAtivos);

export default userRouter;
