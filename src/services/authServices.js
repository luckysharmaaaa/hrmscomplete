import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config/firebase";
import axios from "axios";

export const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    console.log("User:", user);

    const response = await axios.post(
      "http://localhost:5000/v1/auth/login",
      {
        email: user.email,
        fcm: "",
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
