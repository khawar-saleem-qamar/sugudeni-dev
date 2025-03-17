import express from "express";
import * as auth from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", auth.signUp);
authRouter.post("/signin", auth.signIn);
authRouter.patch("/verifySignupOtp", auth.verifySignupOtp);
authRouter.patch("/verifySigninOtp", auth.verifySigninOtp);

export default authRouter;
