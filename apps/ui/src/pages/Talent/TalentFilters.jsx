import {
  CheckboxOption,
  ErrorMessage,
  Input,
  ReactSelect,
} from "@allocate-core/ui-components";
import { blockInvalidNumberInput } from "@allocate-core/util-data-values";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import { isMobile } from "../../common/common";

const TalentFilter = ({
  dropdowns,
  filters,
  setFilters,
  handleChange,
  searchValue,
  handleCountryChange = () => {},
  cityOptions = [],
}) => {
  const [experience, setExperience] = useState({
    isValid: false,
    errorMessage: "",
  });

  const [availability, setAvailability] = useState({
    isValid: false,
    errorMessage: "",
  });

  const validateInput = (startExperience, endExperience, availability) => {
    if (availability < 0 || availability > 100) {
      setAvailability({
        isValid: true,
        errorMessage: "Between 0 to 100",
      });
    } else
      setAvailability({
        isValid: false,
        errorMessage: "",
      });

    if (
      startExperience &&
      endExperience &&
      startExperience?.value > endExperience?.value
    ) {
      setExperience({
        isValid: true,
        errorMessage: "To is less than From",
      });
    } else {
      setExperience({
        isValid: false,
        errorMessage: "",
      });
    }
  };
  useEffect(() => {
    validateInput(filters.yoeFrom, filters.yoeTo, Number(filters.availability));
  }, [filters.yoeFrom, filters.yoeTo, filters.availability]);

  const transformedCountries = dropdowns.countries?.map((country) => ({
    value: country,
    label: country,
  }));

  return (
    <div
      className={`col-xl-8 px-0 flex align-start gap-10 ${isMobile && "flex-col pt-20"}`}
      style={{ flexWrap: "wrap" }}
    >
      <div className="col-xl-3 px-0">
        <ReactSelect
          label="Skillset"
          placeholder="Skillset"
          options={dropdowns.skills}
          value={filters.skills}
          onChange={(value) => {
            setFilters({ skills: value });
            handleChange(searchValue, { ...filters, skills: value });
          }}
          isClearable={false}
          menuPlacement="auto"
          isMulti
        />
        {}
      </div>
      <div className="flex gap-10 hidden-md-up px-0 col-sm-12">
        <div className="col-xl-1 px-0">
          <ReactSelect
            label="Exp: From"
            placeholder="From"
            options={dropdowns.yoeFrom}
            value={filters.yoeFrom}
            isClearable={true}
            isError={experience.isValid}
            onChange={(value) => {
              setFilters({ yoeFrom: value });
              handleChange(searchValue, { ...filters, yoeFrom: value });
            }}
          />
          {experience.isValid && <ErrorMessage message={experience.errorMessage} />}
        </div>
        <div className="col-xl-1 px-0">
          <ReactSelect
            label="Exp: To"
            placeholder="To"
            options={dropdowns.yoeTo}
            value={filters.yoeTo}
            isClearable={true}
            isError={experience.isValid}
            onChange={(value) => {
              setFilters({ yoeTo: value });
              handleChange(searchValue, { ...filters, yoeTo: value });
            }}
          />
          {experience.isValid && <ErrorMessage message={experience.errorMessage} />}
        </div>
        <div className="col-xl-1 px-0">
          <Input
            label="Availability"
            placeholder="Enter availability"
            value={filters.availability}
            type="number"
            max="100"
            min="0"
            step="5"
            onKeyDown={blockInvalidNumberInput}
            onChange={(e) => {
              setFilters({ availability: e.target.value });
              handleChange(searchValue, { ...filters, availability: e.target.value });
            }}
          />
          {availability.isValid && <ErrorMessage message={availability.errorMessage} />}
        </div>
      </div>
      <div className="hidden-sm-down">
        <ReactSelect
          label="Exp: From"
          placeholder="Exp: From"
          options={dropdowns.yoeFrom}
          value={filters.yoeFrom}
          isClearable={true}
          onChange={(value) => {
            setFilters({ yoeFrom: value });
            handleChange(searchValue, { ...filters, yoeFrom: value });
          }}
          menuPlacement="auto"
          isError={experience.isValid}
        />

        {experience.isValid && <ErrorMessage message={experience.errorMessage} />}
      </div>
      <div className="hidden-sm-down">
        <ReactSelect
          label="Exp: To"
          placeholder="Exp: To"
          options={dropdowns.yoeTo}
          value={filters.yoeTo}
          isClearable={true}
          onChange={(value) => {
            setFilters({ yoeTo: value });
            handleChange(searchValue, { ...filters, yoeTo: value });
          }}
          menuPlacement="auto"
          isError={experience.isValid}
        />
        {experience.isValid && <ErrorMessage message={experience.errorMessage} />}
      </div>
      <div className="hidden-sm-down col-xl-2 px-0">
        <Input
          label="Availability"
          placeholder="Availability"
          type="number"
          max="100"
          min="0"
          step="5"
          value={filters.availability}
          onKeyDown={blockInvalidNumberInput}
          onChange={(e) => {
            setFilters({ availability: e.target.value });
            handleChange(searchValue, { ...filters, availability: e.target.value });
          }}
        />
        {availability.isValid && <ErrorMessage message={availability.errorMessage} />}
      </div>
      <div className="hidden-md-up col-sm-12 px-0">
        <ReactSelect
          label="Select Project"
          placeholder="Select Project"
          options={dropdowns.projects}
          value={filters.projects}
          onChange={(value) => {
            setFilters({ projects: value });
            handleChange(searchValue, { ...filters, projects: value });
          }}
          isClearable={false}
          isMulti
        />
      </div>
      <div className="col-xl-3 px-0">
        <ReactSelect
          label="Sort By"
          placeholder="Sort By"
          options={dropdowns.sortBy}
          value={filters.sortBy}
          onChange={(value) => {
            setFilters({ sortBy: value });
            handleChange(searchValue, { ...filters, sortBy: value });
          }}
          isClearable={true}
          menuPlacement="auto"
        />
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          position: "relative",
          right: "318px",
          gap: "22px",
        }}
      >
        <div className="col-xl-3 px-0">
          <ReactSelect
            label="Country"
            placeholder="Select Country"
            options={transformedCountries}
            value={filters.country}
            onChange={(value) => {
              value === null
                ? setFilters({ ...filters, country: value, city: value })
                : setFilters({ ...filters, country: value });
              handleCountryChange(value);
              handleChange(searchValue, { ...filters, country: value });
            }}
            isClearable={true}
            menuPlacement="auto"
          />
        </div>
        <div className="col-xl-3 px-0">
          <ReactSelect
            label="City"
            placeholder="Select City"
            options={cityOptions}
            value={filters.city}
            onChange={(value) => {
              setFilters({ city: value });
              handleChange(searchValue, { ...filters, city: value });
            }}
            isClearable={true}
            menuPlacement="auto"
            isMulti
          />
        </div>
      </div>

      <div className="col-xl-12 px-0 hidden-md-up">
        <ReactSelect
          label="Show Talent"
          placeholder="Select Status"
          options={dropdowns.status}
          isMulti
          value={filters.status}
          onChange={(value) => {
            setFilters({ status: value });
            handleChange(searchValue, { ...filters, status: value });
          }}
          menuPlacement="auto"
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          components={{
            Option: CheckboxOption,
          }}
        />
      </div>
      <div className="col-xl-12 px-0 hidden-md-up">
        <ReactSelect
          placeholder="Select Function"
          options={dropdowns.function}
          value={filters.function}
          onChange={(value) => {
            setFilters((current) => ({
              ...current,
              function: value,
            }));
          }}
        />
      </div>
    </div>
  );
};

TalentFilter.propTypes = {
  dropdowns: PropTypes.shape({
    skills: PropTypes.array.isRequired,
    yoeFrom: PropTypes.array.isRequired,
    yoeTo: PropTypes.array.isRequired,
    projects: PropTypes.array.isRequired,
    sortBy: PropTypes.array.isRequired,
    countries: PropTypes.array.isRequired,
    status: PropTypes.array.isRequired,
    function: PropTypes.array.isRequired,
  }).isRequired,
  filters: PropTypes.shape({
    skills: PropTypes.array,
    yoeFrom: PropTypes.object,
    yoeTo: PropTypes.object,
    availability: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    projects: PropTypes.array,
    sortBy: PropTypes.object,
    country: PropTypes.object,
    city: PropTypes.array,
    status: PropTypes.array,
    function: PropTypes.object,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  searchValue: PropTypes.string,
  handleCountryChange: PropTypes.func,
  cityOptions: PropTypes.array,
};

export default TalentFilter;
