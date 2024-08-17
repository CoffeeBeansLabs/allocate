import AuthenticatedAPI, { CountriesNowAPI } from "./API";

export const getDropdowns = async () => {
  try {
    const response = await AuthenticatedAPI.get("/clients/creation-dropdowns/");
    return Promise.resolve(response.data.dropdowns);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getProjectDropdowns = async () => {
  try {
    const response = await AuthenticatedAPI.get("/projects/creation-dropdowns/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getPositionDropdowns = async () => {
  try {
    const response = await AuthenticatedAPI.get("/projects/position-dropdowns/");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCountries = async () => {
  const countriesURL = "/countries";

  try {
    const response = await CountriesNowAPI.get(countriesURL);
    const countryOptions = response?.data?.data?.map((country) => ({
      value: country.country,
      label: country.country,
    }));
    return Promise.resolve(countryOptions);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCitiesofCountry = async (countryName) => {
  const citiesURL = "/countries/cities/q";
  if (!countryName) return [];
  try {
    const response = await CountriesNowAPI.get(citiesURL, {
      params: {
        country: countryName,
      },
    });
    const cityOptions = response?.data?.data?.map((city) => ({
      value: city,
      label: city,
    }));
    return Promise.resolve(cityOptions);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCurrencies = async () => {
  const currencyURL = "/countries/currency";
  try {
    const response = await CountriesNowAPI.get(currencyURL);
    const currencyOptions = response?.data?.data?.map((currency) => ({
      value: currency.currency,
      label: currency.currency,
    }));
    return Promise.resolve(currencyOptions);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCountriesOfTalents = async () => {
  try {
    const response = await AuthenticatedAPI.get("/user/get-user-countries");
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCitiesOfCountryOfTalents = async (countryName) => {
  if (!countryName) return Promise.resolve([]);
  try {
    const response = await AuthenticatedAPI.get(
      `/user/get-user-cities/?countries=${encodeURIComponent(countryName)}`,
    );
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};
