import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config/firebase";
import { generateFCMToken } from "../firebase-config/fcm";
import axios from "axios";

export const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    console.log("Google User:", user);

    // Generate FCM Token
    const fcmToken = await generateFCMToken();

    console.log("FCM Token:", fcmToken);

    const response = await axios.post(
      "http://localhost:5000/v1/users/user_authentication",
      {
        email: user.email,
        fcm: fcmToken,
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};
