import {
  formatDropdownList,
  getAllPaginatedValues,
} from "@allocate-core/util-data-values";

import {
  getCitiesOfCountryOfTalents,
  getCountriesOfTalents,
  getPositionDropdowns,
} from "../../api/dropdowns";
import { getProjects } from "../../api/projects";
import { capitalizeWords } from "../../common/common";

export const quickSearchDropdowns = async () => {
  const dropdowns = {
    projects: [],
    roles: [],
    skills: [],
    countries: [],
    cities: [],
  };

  try {
    const dropdownResponse = await getPositionDropdowns();
    dropdowns.roles = formatDropdownList(dropdownResponse.dropdowns?.roles);
    dropdowns.skills = formatDropdownList(dropdownResponse.dropdowns?.skills);

    const projectResponse = await getAllPaginatedValues(getProjects, "projects");
    dropdowns.projects = formatDropdownList(
      projectResponse.map((project) => {
        return { id: project.id, name: project.name };
      }),
    );

    const countryResponse = await getCountriesOfTalents();
    dropdowns.countries = countryResponse.countries;

    return Promise.resolve(dropdowns);
  } catch (errResponse) {
    return Promise.reject(errResponse);
  }
};

export const updateCities = async (selectedCountry, setCityOptions) => {
  try {
    const cityResponse = await getCitiesOfCountryOfTalents(selectedCountry.value);
    if (cityResponse && cityResponse.cities) {
      const cities = cityResponse.cities.map((city) => ({
        value: capitalizeWords(city),
        label: capitalizeWords(city),
      }));
      setCityOptions(cities);
    } else {
      console.warn("No cities found for the selected country");
      setCityOptions([]);
    }
  } catch (error) {
    console.error("Error fetching cities:", error);
    setCityOptions([]);
  }
};
