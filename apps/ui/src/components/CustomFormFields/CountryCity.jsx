import { FormikReactSelect } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import {
  getCitiesofCountry,
  getCitiesOfCountryOfTalents,
  getCountries,
  getCountriesOfTalents,
} from "../../api/dropdowns";
import { capitalizeWords } from "../../common/common";

const CountryCity = (props) => {
  const { countryValue, cityValue, dirty, setFieldValue, isMulti, index } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const cityName = isMulti ? `city.${index}` : "city";
  const countryName = isMulti ? `country.${index}` : "country";

  useEffect(() => {
    if (!isMulti) {
      setIsLoading(true);
      getCountries()
        .then((response) => {
          setCountryOptions(response);
        })
        .catch(() => {
          setCountryOptions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }
    setIsLoading(true);
    getCountriesOfTalents()
      .then((response) => {
        const formattedOptions = response.countries.map((country) => ({
          value: country,
          label: country,
        }));
        setCountryOptions(formattedOptions);
      })
      .catch(() => {
        setCountryOptions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isMulti]);

  useEffect(() => {
    if (!isMulti) {
      (async () => {
        setIsLoading(true);
        try {
          const response = await getCitiesofCountry(countryValue?.value);
          setCityOptions(response);
        } catch (error) {
          setCityOptions([]);
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }
    getCitiesOfCountryOfTalents(countryValue[index]?.value)
      .then((response) => {
        const formattedOptions = response.cities.map((city) => ({
          value: capitalizeWords(city),
          label: capitalizeWords(city),
        }));
        setCityOptions(formattedOptions);
      })
      .catch(() => {
        setCityOptions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    if (dirty && cityValue && cityValue?.value && cityValue?.label) {
      setFieldValue("city", "");
    }
  }, [isMulti ? countryValue[index]?.value : countryValue?.value, isMulti]);

  return (
    <div className="row">
      <div className="col-xl-6 pt-20">
        <FormikReactSelect
          required
          isLoading={isLoading}
          loadingMessage="Loading options ..."
          name={countryName}
          label={isMulti ? "Country" : "Country *"}
          isDisabled={isLoading}
          placeholder="Select Country"
          options={countryOptions}
          isClearable
          onChange={(value) => {
            if (value === null) setFieldValue(cityName, []);
            setFieldValue(countryName, value);
          }}
        />
      </div>
      <div className="col-xl-6 pt-20">
        <FormikReactSelect
          required
          isLoading={isLoading}
          loadingMessage="Loading options ..."
          name={cityName}
          label={isMulti ? "City" : "City *"}
          isDisabled={isLoading}
          placeholder="Select city"
          options={cityOptions}
          controlShouldRenderValue={!(cityValue === "")}
          isMulti={isMulti}
          isClearable
        />
      </div>
    </div>
  );
};

CountryCity.propTypes = {
  countryValue: PropTypes.object,
  cityValue: PropTypes.object,
  dirty: PropTypes.bool,
  setFieldValue: PropTypes.func.isRequired,
  isMulti: PropTypes.bool,
  index: PropTypes.number,
};

export default CountryCity;
