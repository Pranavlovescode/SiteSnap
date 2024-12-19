
import { PrismaClient } from "@prisma/client";
import { SignInSchema } from "../types/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const prisma = new PrismaClient();

export const loginController = async (req, res) => {
  try {
    const body = req.body;
    const parseData = SignInSchema.safeParse(body);
    console.log("Going through this")
    console.log(parseData.success)
    if (parseData.success) {

      const userFound = await prisma.user.findUnique({
        where: {
          email: parseData.data.email,
        },
      });
      console.log(userFound);
      if (userFound) {
        // const hashPassword = bcrypt.hash(parseData.data.password,10)
        const passwordMatch = await bcrypt.compare(
          parseData.data.password,
          userFound.password
        );
        console.log(passwordMatch);
        if (passwordMatch) {
          // console.log("signing jwt token");
          // console.log("JWT_SECRET",process.env.JWT_SECRET)
          // Session logic goes here
          const jwtToken = await jwt.sign(
            { id: userFound.id, email: userFound.email, name: userFound.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          console.log(jwtToken);
          // console.log("setting cookie");
          res.cookie("auth_token", jwtToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
          });

          res.cookie("user_data", JSON.stringify(userFound), {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            domain: "localhost",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
          });

          res.status(200).json({ message: "Login successfull" });
        } else {
          res.status(404).json({ message: "Invalid Credential" });
        }
      } else {
        res.status(403).json({ message: "Your are not signed in !!" });
      }
    } else {
      res.status(400).json({ message: "validation failed" });
    }
  } catch (error) {
    res.status(200).json({ message: "Error while logging user" });
  }
};


