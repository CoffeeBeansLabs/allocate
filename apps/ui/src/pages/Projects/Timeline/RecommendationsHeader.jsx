import { Heading, ReactSelect, SearchInput, Text } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackArrow from "/icons/arrow-right.svg";
import SearchIcon from "/icons/search.svg";

import {
  getCitiesOfCountryOfTalents,
  getCountriesOfTalents,
} from "../../../api/dropdowns";
import { capitalizeWords, isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import MobileModal from "../../../components/MobileModal/MobileModal";
import { fetchProjectDetails } from "./Recommendations";
import styles from "./timeline.module.css";

const RecommendationsHeader = (props) => {
  const {
    value = "",
    setSearchValue,
    selectedCountry,
    selectedCity,
    setSelectedCountry,
    setSelectedCity,
    projectId,
    fetchData,
    setStoreForSearch,
    resetRecommendations,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState(value);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const params = useParams();
  const navigate = useNavigate();

  const fetchCountries = async () => {
    try {
      const countriesData = await getCountriesOfTalents();
      const transformedCountries = countriesData.countries.map((country) => ({
        value: country,
        label: country,
      }));
      setCountries(transformedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchCities = async (countryValue) => {
    try {
      const citiesData = await getCitiesOfCountryOfTalents(countryValue);
      const transformedCities = citiesData?.cities?.map((city) => ({
        value: capitalizeWords(city),
        label: capitalizeWords(city),
      }));
      setCities(transformedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchCities(selectedCountry?.value);
  }, [selectedCountry?.value]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId, setSelectedCountry, setSelectedCity, fetchData);
    }
  }, [projectId]);

  return (
    <React.Fragment>
      <header className="hidden-md-up">
        <Header className="flex align-center">
          <img
            src={BackArrow}
            alt="back button arrow"
            role="presentation"
            onClick={() => {
              if (params && params?.projectId)
                navigate(`/projects/timeline/${params.projectId}`);
              else navigate("/quick-search");
            }}
          />
          <Heading size="h6" fontWeight="medium">
            Recommendations
          </Heading>
          <img
            src={SearchIcon}
            role="presentation"
            alt="search for roles or talent"
            onClick={() => setShowModal(!showModal)}
          />
        </Header>
      </header>
      <header className={`hidden-sm-down flex align-items-end ${styles.timelineHeader}`}>
        <div className="col-xl-4 flex-col gap-10">
          <Text size="b2" className={styles.pageNavPosition}>
            Projects / View Details / Add Talent
          </Text>
          <div className="flex align-center" style={{ paddingLeft: 32 }}>
            <Heading as="h1" size="h4" fontWeight="bold">
              Recommendations
            </Heading>
          </div>
        </div>
        <div className="ml-auto col-xl-4">
          <SearchInput
            placeholder="Search talents here"
            value={value}
            showCloseBtn
            onClear={() => {
              setSearchValue("");
            }}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
        </div>
        <div className="ml-auto col-xl-2">
          <ReactSelect
            label="Country"
            placeholder="Select Country"
            options={countries}
            value={selectedCountry}
            onChange={(selectedOption) => {
              setSelectedCountry(selectedOption);
              setSelectedCity(null); // Clear city when country changes
              if (selectedOption === null) {
                fetchData(1, false, null, null);
                resetRecommendations();
              }
              fetchCities(selectedOption?.value);
            }}
            isClearable
          />
        </div>
        <div className="ml-auto col-xl-2">
          <ReactSelect
            label="City"
            placeholder="Select City"
            options={cities}
            value={selectedCity}
            isClearable
            onChange={(selectedOption) => {
              setSelectedCity(selectedOption);
              setStoreForSearch();
              if (selectedOption?.length !== 0) {
                const cities = selectedOption?.map((city) => city?.value);
                fetchData(1, false, null, cities);
                resetRecommendations();
              }
            }}
            isMulti
          />
        </div>
      </header>
      {isMobile && (
        <MobileModal
          showTitle={true}
          isFullScreen={false}
          isOpen={showModal}
          title="Search talents here"
          onClose={() => setShowModal(false)}
        >
          <div style={{ marginTop: 27, marginLeft: 15, marginRight: 15 }}>
            <SearchInput
              placeholder="Search talents here"
              value={query}
              defaultValue=""
              showCloseBtn
              onClear={() => {
                setQuery("");
                setSearchValue("");
              }}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setSearchValue(query);
                }
              }}
            />
          </div>
        </MobileModal>
      )}
    </React.Fragment>
  );
};
RecommendationsHeader.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.string,
  setSearchValue: PropTypes.func.isRequired,
  selectedCountry: PropTypes.object,
  selectedCity: PropTypes.array,
  setSelectedCountry: PropTypes.func.isRequired,
  setSelectedCity: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  setStoreForSearch: PropTypes.func.isRequired,
  resetRecommendations: PropTypes.func.isRequired,
};

export default RecommendationsHeader;
