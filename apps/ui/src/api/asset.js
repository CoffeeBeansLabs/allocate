import AuthenticatedAPI from "./API";
import { cleanQueryParams } from "./utils";

export const getAllAssets = async (params = {}) => {
  try {
    const response = await AuthenticatedAPI.get("/assets/", {
      params: cleanQueryParams(params),
    });
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAssetBrands = async () => {
  try {
    const response = await AuthenticatedAPI.get("/assets/brands/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const postAssetBrand = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/assets/brands/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAssetTypes = async () => {
  try {
    const response = await AuthenticatedAPI.get("/assets/types/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const postAssetType = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/assets/types/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAssetStatus = async () => {
  try {
    const response = await AuthenticatedAPI.get("/assets/status");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAssetModels = async () => {
  try {
    const response = await AuthenticatedAPI.get("/assets/models/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const postAssetModel = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post("/assets/models/", payload);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createAsset = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(`/assets/`, payload);
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const createInUseAsset = async (payload) => {
  try {
    const response = await AuthenticatedAPI.post(`/assets/in-use-assets/`, payload);
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const editAsset = async (serialNum, payload) => {
  try {
    const response = await AuthenticatedAPI.put(
      `/assets/inventory-asset/${serialNum}/`,
      payload,
    );
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const getAssetById = async (assetId) => {
  try {
    const response = await AuthenticatedAPI.get(
      `/assets/inventory-asset/${encodeURIComponent(assetId)}/`,
    );
    return Promise.resolve(response.data.asset);
  } catch (error) {
    return Promise.reject(error.response);
  }
};

export const updateClient = async (clientId, clientPayload) => {
  const url = `/clients/${clientId}/`;
  try {
    const response = await AuthenticatedAPI.put(url, clientPayload);
    return Promise.resolve(response.status);
  } catch (error) {
    return Promise.reject(error.response);
  }
};
