import {
  Button,
  Divider,
  Heading,
  ReactSelect,
  Text,
} from "@allocate-core/ui-components";
import { formatISO } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import BackArrow from "/icons/arrow-right.svg";
import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";
import FilterIcon from "/icons/filter.svg";

import { quickSearch } from "../../../api/search";
import { isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import MobileModal from "../../../components/MobileModal/MobileModal";
import { useCommonStore } from "../../../store/commonStore";
import { useSearchStore } from "../../../store/searchStore";
import { quickSearchDropdowns } from "../quickSearchDropdowns";
import ResultFilter from "./ResultFilter";
import Results from "./Results";
import styles from "./searchResults.module.css";

const SearchResult = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dropdowns, setDropdowns] = useSearchStore(
    (state) => [state.dropdowns, state.setDropdowns],
    shallow,
  );

  const data = JSON.parse(localStorage.getItem("quick-search"));
  const [currentTab, setCurrentTab] = useSearchStore(
    (state) => [state.currentTab, state.setCurrentTab],
    shallow,
  );

  const [projects, setProjects] = useSearchStore(
    (state) => [state.projects, state.setProjects],
    shallow,
  );

  const [positionValues, setPositionValues] = useSearchStore(
    (state) => [state.positionValues, state.setPositionValues],
    shallow,
  );

  const [showRelatedSuggestions, setShowRelatedSuggestions] = useSearchStore(
    (state) => [state.showRelatedSuggestions, state.setShowRelatedSuggestions],
    shallow,
  );

  const [pageNumber, setPageNumber, incrementPageNumber] = useSearchStore(
    (state) => [state.pageNumber, state.setPageNumber, state.incrementPageNumber],
    shallow,
  );

  const [recommendations, setRecommendations, resetRecommendations] = useSearchStore(
    (state) => [
      state.recommendations,
      state.setRecommendations,
      state.resetRecommendations,
    ],
    shallow,
  );

  const [lastElement, setLastElement] = useSearchStore(
    (state) => [state.lastElement, state.setLastElement],
    shallow,
  );

  const [hasNavigatedBack, setHasNavigatedBack] = useCommonStore(
    (state) => [state.hasNavigatedBack, state.setHasNavigatedBack],
    shallow,
  );
  const [isFirstTab, setIsFirstTab] = useSearchStore(
    (state) => [state.isFirstTab, state.setIsFirstTab],
    shallow,
  );

  const [isLastTab, setIsLastTab] = useSearchStore(
    (state) => [state.isLastTab, state.setIsLastTab],
    shallow,
  );

  const navigate = useNavigate();

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        incrementPageNumber();
      }
    }),
  );

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  useEffect(() => {
    if (
      !dropdowns?.projects?.length &&
      !dropdowns?.roles?.length &&
      !dropdowns?.skills?.length
    ) {
      setIsLoading(true);
      quickSearchDropdowns()
        .then((dropdown) => {
          setDropdowns({
            projects: dropdown?.projects,
            roles: dropdown.roles,
            skills: dropdown.skills,
          });
        })
        .catch((errResponse) => toast.error(errResponse?.data?.detail))
        .finally(() => setIsLoading(false));
    }
  }, []);

  const fetchData = () => {
    const payload = {
      role: positionValues?.role?.value || null,
      skills: positionValues?.skills?.map((item) => item.value),
      projects: projects?.map((item) => item.value),
      country: data?.country?.map((item) => item?.value) || null,
      locations: data?.city?.flat()?.map((item) => item.value) || [],
      experience_range_start: positionValues?.experienceRangeStart
        ? positionValues?.experienceRangeStart.value
        : null,
      experience_range_end: positionValues?.experienceRangeEnd
        ? positionValues?.experienceRangeEnd.value
        : null,
      utilization: Number(positionValues?.utilization),
      start_date: positionValues?.dateValues?.[0]
        ? formatISO(new Date(positionValues?.dateValues[0]), { representation: "date" })
        : null,
      end_date: positionValues?.dateValues?.[1]
        ? formatISO(new Date(positionValues?.dateValues[1]), { representation: "date" })
        : null,
      related_suggestions: showRelatedSuggestions,
      page: pageNumber,
    };

    setIsLoading(true);
    quickSearch(payload)
      .then((res) => {
        setRecommendations(res);
      })
      .catch((errResponse) => toast.error(errResponse))
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (pageNumber !== 1 || showRelatedSuggestions !== false) {
      if (!hasNavigatedBack) {
        resetRecommendations();
        setShowRelatedSuggestions(false);
        setPageNumber(1);
      }
    } else {
      if (!hasNavigatedBack) {
        resetRecommendations();
        fetchData();
      }
    }
    setHasNavigatedBack(false);
  }, [projects, positionValues]);

  useEffect(() => {
    const maxPageCount = showRelatedSuggestions
      ? Math.ceil(recommendations.otherRoles.count / 10)
      : Math.ceil(recommendations.sameRole.count / 10);
    if (pageNumber <= maxPageCount && !hasNavigatedBack) {
      fetchData();
    } else if (!showRelatedSuggestions && positionValues?.role?.label) {
      setShowRelatedSuggestions(true);
      setPageNumber(1);
    }
    setHasNavigatedBack(false);
  }, [pageNumber, showRelatedSuggestions]);

  const handleChange = (field, updatedField) => {
    const positionToChange = { ...positionValues };
    positionToChange[field] = updatedField;
    if (field === "country") {
      positionToChange.country = updatedField;
    } else if (field === "city") {
      positionToChange.locations = updatedField;
    }

    setPositionValues(positionToChange);
    const updatedData = { ...data };
    const positions = updatedData?.positions;
    if (positions?.[currentTab]) {
      positions[currentTab] = { ...positionToChange };
    }
    updatedData.positions = positions;
    localStorage.setItem("quick-search", JSON.stringify(updatedData));
  };

  useEffect(() => {
    setIsFirstTab(currentTab === 0);
    setIsLastTab(currentTab === data?.positions?.length - 1);
  }, [currentTab]);

  return (
    <section className={styles.section}>
      <header className="hidden-md-up">
        <Header>
          <img
            src={BackArrow}
            alt="back button arrow"
            role="presentation"
            onClick={() => navigate(-1)}
          />

          <Heading size="h6" fontWeight="medium">
            Quick Search Results
          </Heading>
          <img
            src={FilterIcon}
            alt="filter clients"
            className="ml-auto"
            role="presentation"
            onClick={() => setIsFilterOpen(true)}
          />
        </Header>
      </header>
      <header className={`hidden-sm-down ${styles.header}`}>
        <Heading size="h4" fontWeight="bold">
          Quick Search Results
        </Heading>
        <ResultFilter
          dropdowns={dropdowns}
          handleChange={handleChange}
          positionValues={positionValues}
        />
      </header>
      <div className={`flex gap-40 ${styles.tabs}`}>
        <div className="col-xl-2 hidden-sm-down">
          <ReactSelect
            label="Project"
            value={projects}
            onChange={(value) => {
              setProjects(value);
              const updatedData = {
                ...data,
                projects: value,
              };
              localStorage.setItem("quick-search", JSON.stringify(updatedData));
            }}
            placeholder="Select Project"
            options={dropdowns.projects}
            isClearable={false}
            isMulti
            menuPlacement="auto"
          />
        </div>
        {data?.positions?.map((pos, idx) => (
          <div
            key={`${pos?.role?.label}_${idx}`}
            className={`${styles.tab} ${
              idx === currentTab && styles.active
            } hidden-sm-down`}
            onClick={() => {
              setCurrentTab(idx);
              setPositionValues(pos);
            }}
            onKeyDown={() => {
              setCurrentTab(idx);
              setPositionValues(pos);
            }}
            role="button"
            tabIndex={0}
          >
            <Heading size="h6" fontWeight="bold">
              {pos?.role?.label || `Search ${idx + 1}`}
            </Heading>
          </div>
        ))}
        <div className={`hidden-md-up flex-center gap-20 ${styles.roleNavigate}`}>
          <Button
            onClick={() => {
              setCurrentTab(0, "View previous Role");
              if (!isFirstTab) setPositionValues(data?.positions[currentTab - 1]);
            }}
            className={isFirstTab ? styles.inactive : ""}
          >
            <img src={ArrowBlueFilled} alt="View previous Role" />
          </Button>
          <Text size="b1" fontWeight="regular">
            {positionValues?.role?.label || `Search ${currentTab + 1}`}
          </Text>
          <Button
            className={isLastTab ? styles.inactive : ""}
            onClick={() => {
              setCurrentTab(data?.positions?.length - 1, "view next Role");
              if (!isLastTab) setPositionValues(data?.positions[currentTab + 1]);
            }}
          >
            <img
              className={styles.arrowRight}
              src={ArrowBlueFilled}
              alt="view next month"
            />
          </Button>
        </div>
      </div>
      {isMobile && <Divider />}
      <Results
        recommendations={recommendations}
        setLastElement={setLastElement}
        isLoading={isLoading}
        hideHeading={!positionValues?.role?.label}
      />
      <MobileModal
        title="Primary Filters"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        isFullScreen={false}
        showTitle
      >
        <ResultFilter
          dropdowns={dropdowns}
          handleChange={handleChange}
          positionValues={positionValues}
        />
        <div className="flex-col gap-20 pt-20">
          <Heading size="h6">Select Project</Heading>
          <ReactSelect
            value={projects}
            onChange={(value) => {
              setProjects(value);
              const updatedData = {
                ...data,
                projects: value,
              };
              localStorage.setItem("quick-search", JSON.stringify(updatedData));
            }}
            placeholder="Select Project"
            options={dropdowns.projects}
            isClearable={false}
            isMulti
            menuPlacement="auto"
          />
          <Button
            variant="primary"
            className="mt-16 col-sm-12"
            onClick={() => {
              setIsFilterOpen(false);
            }}
          >
            Apply Filter
          </Button>
        </div>
      </MobileModal>
    </section>
  );
};

export default SearchResult;
