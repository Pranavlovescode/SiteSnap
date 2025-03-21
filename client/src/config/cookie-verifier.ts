import jwt from "jsonwebtoken";

type cookie = {
  name: string;
  value: string;
};

// Define the custom decoded token type
type DecodedToken ={
  id: string;
  name: string;
  email: string;
  exp: number;
  iat: number;
}

export const verifyCookieFrontend = (cookie: cookie[]): DecodedToken | null => {
  const cookieName = cookie.find(
    (cookie_name: cookie) => cookie_name.name === "session_cookie"
  );

  console.log("Cookie ", cookieName);

  if (!cookieName) {
    console.error("Auth token not found");
    return null;
  }

  try {
    const decoded = jwt.decode(cookieName.value) as DecodedToken | null;

    // Validate the structure of the decoded object
    if (
      decoded &&
      typeof decoded === "object" &&
      "id" in decoded &&
      "name" in decoded &&
      "email" in decoded &&
      "exp" in decoded &&
      "iat" in decoded
    ) {
      console.log("Cookie decoded", decoded);
      return decoded;
    }

    console.error("Invalid token structure");
    return null;
  } catch (error) {
    console.error("Error while verifying cookie", error);
    return null;
  }
};
