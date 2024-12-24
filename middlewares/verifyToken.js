import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const publicPaths = ["/auth/login", "/auth/signup"];
    if (publicPaths.includes(req.path)) {
      return next();
    }
    // Get the token from the cookies
    const authCookie = req.cookies["auth_token"];
    const session_cookie = req.cookies["connect.sid"];
    console.log(authCookie);
    console.log("session cookie ",session_cookie);
    if (!authCookie && !session_cookie) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    } else {
      // Verify the token
      jwt.verify(authCookie, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ message: "Unauthorized: Invalid token" });
        }
        // Attach decoded data to the request object for further use
        req.user = decoded;

        // Call the next middleware
        next();
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default isAuthenticated;
