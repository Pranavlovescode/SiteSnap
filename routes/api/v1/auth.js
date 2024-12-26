import { Router } from "express";
import isAuthenticated from "../../../middlewares/verifyToken.js";
import { loginController } from "../../../controllers/loginController.js";
import {
  signupController,
  signupWithGoogle,
} from "../../../controllers/signupController.js";
import passport from "passport";

const router = Router();

// router.use(session({
//     secret: process.env.SESSION_SECRET || "qljfe9KrD9HF3i+9b3B5xpdErJJbUF+rw9vgUoO61rg=",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60 * 60 * 1000 }
// }))

router.get("/", (req, res) => {
  // console.log(res)
  res.json({ message: "This is working" });
});

// `/api/v1/auth/signup`
router.post("/signup", signupController);
// router.post("/signupWithGoogle",signupWithGoogle );

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile","openid","email"] })
);

router.get("/google/callback",passport.authenticate('google',{
  successRedirect:process.env.FRONTEND_URL
}),(req,res)=>{
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
});

// `/api/v1/auth/login`
router.post("/login", loginController);

// `/api/v1/auth/logout`
router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.clearCookie("user_data");
  res.clearCookie("connect.sid");
  res.status(200).json({ message: "Logout successfull" });
});

// const isAuthenticated = (req, res, next) => {
//   const auth_cookie = req.cookies.auth_token;
//   if (auth_cookie) {
//     jwt.verify(auth_cookie, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         res.status(401).json({ message: "Unauthorized" });
//       } else {
//         console.log(decoded);
//         next();
//       }
//     });
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

// Protected route example
router.get("/protected", isAuthenticated, (req, res) => {
  const user_data = JSON.parse(req.cookies.user_data);
  res.json({ message: `Welcome ${user_data.name}` });
});

export default router;
