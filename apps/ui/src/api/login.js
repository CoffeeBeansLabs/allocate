import Axios from "axios";

import AuthenticatedAPI, { BASE_API_URL } from "./API";
import { REFRESH, TOKEN, USER } from "./constants";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      ?.atob(base64)
      ?.split("")
      ?.map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      ?.join(""),
  );

  return JSON.parse(jsonPayload);
}

export const authenticateUser = async (authCode) => {
  const loginURL = `${BASE_API_URL}/auth/login/`;
  try {
    const response = await Axios.post(loginURL, {
      code: authCode.code,
    });

    const { access, refresh, user } = response.data;

    localStorage.setItem(TOKEN, access);
    localStorage.setItem(REFRESH, refresh);
    localStorage.setItem(USER, JSON.stringify(user));
    return Promise.resolve(user);
  } catch (error) {
    return Promise.reject();
  }
};

export async function getNewToken(refresh_token) {
  try {
    const refreshTokenURL = `${BASE_API_URL}/auth/token/refresh/`;
    const response = await Axios.post(refreshTokenURL, {
      refresh: refresh_token,
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(false);
  }
}

export const signOutUserSession = (callback) => {
  localStorage.clear();

  if (typeof callback === "function") {
    callback();
  }
};

export async function isAuthenticated() {
  try {
    const AUTH_TOKEN = localStorage.getItem(TOKEN);
    const REFRESH_TOKEN = localStorage.getItem(REFRESH);
    if (AUTH_TOKEN && REFRESH_TOKEN) {
      const AUTH_TOKEN_EXPIRY = new Date(parseJwt(AUTH_TOKEN).exp * 1000);
      const REFRESH_TOKEN_EXPIRY = new Date(parseJwt(REFRESH_TOKEN).exp * 1000);
      const currentDate = new Date();
      if (currentDate < AUTH_TOKEN_EXPIRY) {
        return true;
      } else {
        if (currentDate < REFRESH_TOKEN_EXPIRY) {
          try {
            const response = await getNewToken(REFRESH_TOKEN);
            localStorage.setItem(TOKEN, response.access);
            return true;
          } catch (error) {
            return false;
          }
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

export const getAllFeatureFlags = async () => {
  try {
    const response = await AuthenticatedAPI.get("/common/feature-flag/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
