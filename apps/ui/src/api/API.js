import Axios from "axios";

import { AUTHORIZATION, REFRESH, TOKEN } from "./constants";
import { getNewToken } from "./login";

const AUTH_TOKEN = localStorage.getItem(TOKEN);

const client_hostname = window.location.hostname;
export const BASE_API_URL = client_hostname.includes("localhost")
  ? "http://localhost:8000/api/v1"
  : `https://${client_hostname}/api/v1`;

export const COUNTRIES_NOW_URL = "https://countriesnow.space/api/v0.1";

const AuthenticatedAPI = Axios.create({
  baseURL: BASE_API_URL,
  headers: {
    common: {
      [AUTHORIZATION]: `Bearer ${AUTH_TOKEN}`,
    },
  },
});

export const BaseAPI = Axios.create({
  baseURL: BASE_API_URL,
});

export const CountriesNowAPI = Axios.create({
  baseURL: COUNTRIES_NOW_URL,
});

AuthenticatedAPI.interceptors.response.use(
  (response) => response,
  async function (error) {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const REFRESH_TOKEN = localStorage.getItem(REFRESH);
      const response = await getNewToken(REFRESH_TOKEN);

      localStorage.setItem(TOKEN, response.access);

      AuthenticatedAPI.defaults.headers.common[AUTHORIZATION] =
        `Bearer ${response.access}`;

      originalRequest.headers[AUTHORIZATION] = `Bearer ${response.access}`;

      return AuthenticatedAPI.request(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default AuthenticatedAPI;
