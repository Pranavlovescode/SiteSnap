import axios from "axios";

export async function getSession(sessionToken) {
  try {
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/auth/session`,
      {
        headers: {
          Cookie: `next-auth.session-token=${sessionToken}; __Secure-next-auth.session-token=${sessionToken}`,
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching session:",
      error.response?.data || error.message
    );
    return null;
  }
}
