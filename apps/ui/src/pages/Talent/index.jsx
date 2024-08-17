import {
  Button,
  CheckboxOption,
  Divider,
  Heading,
  ReactSelect,
  SearchInput,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { getCurrentTimeline } from "@allocate-core/util-data-values";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";
import FilterIcon from "/icons/filter.svg";
import MenuIcon from "/icons/menuIcon.svg";

import { getTalents } from "../../api/talent";
import { debounce, isMobile } from "../../common/common";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import MobileModal from "../../components/MobileModal/MobileModal";
import MobileTalentInfo from "../../components/SkillsCard/MobileTalentInfo";
import TalentItem from "../../components/TalentItem";
import AllocationWrapper from "../../components/Timeline/AllocationWrapper";
import DatesInCurrentTimeline from "../../components/Timeline/DatesInCurrentTimeline";
import Legends from "../../components/Timeline/Legends";
import UserAllocation from "../../components/Timeline/UserAllocation";
import { useCommonStore } from "../../store/commonStore";
import { initialFilterState, useTalentStore } from "../../store/talentStore";
import { quickSearchDropdowns, updateCities } from "../QuickSearch/quickSearchDropdowns";
import styles from "./talent.module.css";
import TalentFilters from "./TalentFilters";

const Talent = () => {
  const [month, incrementMonth, decrementMonth] = useTalentStore(
    (state) => [state.month, state.incrementMonth, state.decrementMonth],
    shallow,
  );
  const [currentTimeline, setCurrentTimeline] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const numberOfColumns = currentTimeline?.length;
  const backgroundSize = `${100 / numberOfColumns || 1}%`;
  const gridColumn = `1 / ${numberOfColumns + 1}`;
  const gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`;
  const wrapperStyle = { gridColumn, gridTemplateColumns };

  useEffect(() => {
    setCurrentTimeline(getCurrentTimeline(month));
  }, [month]);

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdowns, setDropdowns] = useTalentStore(
    (state) => [state.dropdowns, state.setDropdowns],
    shallow,
  );

  const [filters, setFilters] = useTalentStore(
    (state) => [state.filters, state.setFilters],
    shallow,
  );
  const [talentList, setTalentList, addTalent] = useTalentStore(
    (state) => [state.talentList, state.setTalentList, state.addTalent],
    shallow,
  );
  const [talentCount, setTalentCount] = useTalentStore(
    (state) => [state.talentCount, state.setTalentCount],
    shallow,
  );
  const [lastElement, setLastElement] = useTalentStore(
    (state) => [state.lastElement, state.setLastElement],
    shallow,
  );
  const [pageNumber, setPageNumber, incrementPageNumber] = useTalentStore(
    (state) => [state.pageNumber, state.setPageNumber, state.incrementPageNumber],
    shallow,
  );
  const [maxPageCount, setMaxPageCount] = useTalentStore(
    (state) => [state.maxPageCount, state.setMaxPageCount],
    shallow,
  );
  const [searchValue, setSearchValue] = useTalentStore(
    (state) => [state.searchValue, state.setSearchValue],
    shallow,
  );
  const [resetFromSamePage, setResetFromSamePage] = useTalentStore(
    (state) => [state.resetFromSamePage, state.setResetFromSamePage],
    shallow,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lastPosition, setLastPosition] = useCommonStore(
    (state) => [state.lastPosition, state.setLastPosition],
    shallow,
  );

  const [hasNavigatedBack, setHasNavigatedBack] = useCommonStore(
    (state) => [state.hasNavigatedBack, state.setHasNavigatedBack],
    shallow,
  );

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        incrementPageNumber();
      }
    }),
  );

  useEffect(() => {
    if (dropdowns?.projects?.length === 0 && dropdowns?.skills?.length === 0) {
      setIsLoading(true);
      quickSearchDropdowns()
        .then((dropdown) => {
          setDropdowns({
            projects: dropdown.projects,
            skills: dropdown.skills,
            countries: dropdown.countries,
            cities: cityOptions, // Initialize cities as an empty array
          });
          if (selectedCountry) {
            updateCities(selectedCountry, setCityOptions);
          }
        })
        .catch((errResponse) => toast.error(errResponse?.data?.detail))
        .finally(() => setIsLoading(false));
    }
  }, [selectedCountry]);

  const fetchTalentData = (searchQuery, filters) => {
    if (!filters.city && filters.country) {
      toast.error("Please select a City!");
      return;
    }
    setIsLoading(true);
    getTalents({
      search: searchQuery || null,
      page: pageNumber,
      size: 10,
      sort_by: filters.sortBy?.value,
      experience_range_start: filters.yoeFrom?.value,
      experience_range_end: filters.yoeTo?.value,
      availability: Number(filters.availability) || null,
      project: filters.projects.map((proj) => proj?.value),
      skills: filters.skills.map((skill) => skill?.value),
      status: filters.status?.map((item) => item?.value),
      function: filters.function?.value,
      country: filters.country?.value || null,
      locations: filters.city?.map((item) => item?.value) || null,
    })
      .then((response) => {
        const resultsNotInList =
          Math.min(pageNumber * 10, response.count) > talentList.length;
        if (pageNumber === 1 && talentList.length === 0) setTalentList(response.users);
        else if (resultsNotInList) addTalent(response.users, true);
        setTalentCount(response?.count);
        setMaxPageCount(Math.ceil(response.count / 10));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
        setResetFromSamePage(false);
      });
  };

  const debouncedHandler = useCallback(debounce(fetchTalentData, 500), [
    filters,
    pageNumber,
  ]);

  useEffect(() => {
    if (pageNumber <= maxPageCount && !hasNavigatedBack) {
      !searchValue
        ? fetchTalentData(searchValue, filters)
        : debouncedHandler(searchValue, filters);
    }
    setHasNavigatedBack(false);
  }, [pageNumber, resetFromSamePage]);

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

  useLayoutEffect(() => {
    if (lastPosition) {
      const element = document.getElementById(lastPosition);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 0);
      }
    }
    setLastPosition(null);
  }, [talentList, lastPosition]);

  const handleChange = (searchValue, filters) => {
    if (pageNumber !== 1) {
      setTalentList([]);
      setPageNumber(1);
    } else {
      setTalentList([]);
      debouncedHandler(searchValue, filters);
    }
  };

  const handleCountryChange = (selectedCountry) => {
    setSelectedCountry(selectedCountry);
    updateCities(selectedCountry, setCityOptions);
  };
  return (
    <React.Fragment>
      {isLoading ? <Spinner /> : null}
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex justify-between" style={{ flexBasis: "35%" }}>
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              People
            </Heading>
          </div>
          <img
            src={FilterIcon}
            alt="filter talents"
            role="presentation"
            onClick={() => setIsFilterOpen(true)}
          />
        </Header>
      </header>
      <header className={`hidden-sm-down ${styles.talentHeader}`}>
        <div className="flex align-start" style={{ flexWrap: "wrap" }}>
          <Heading
            as="h1"
            size="h4"
            fontWeight="bold"
            style={{ margin: "40px 6px 0px 0px" }}
          >
            People
          </Heading>
          <div className="col-xl-3">
            <Text size="b2" fontWeight="medium" className={styles.searchLabel}>
              Search People / Roles / EmpID
            </Text>
            <SearchInput
              placeholder="Search People / Roles / EmpID"
              showCloseBtn
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                handleChange(e.target.value, filters);
              }}
              onClear={() => {
                setSearchValue("");
                handleChange("", filters);
              }}
            />
          </div>
          <TalentFilters
            dropdowns={dropdowns}
            filters={filters}
            setFilters={setFilters}
            handleChange={handleChange}
            searchValue={searchValue}
            handleCountryChange={handleCountryChange}
            cityOptions={cityOptions}
          />
        </div>
      </header>
      <section className={styles.timelineWrapper}>
        <aside className={styles.talentSectionWrapper}>
          {isMobile && (
            <div className="col-sm-12 px-0">
              <SearchInput
                placeholder="Search People / Roles / EmpID"
                showCloseBtn
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  handleChange(e.target.value, filters);
                }}
                onClear={() => {
                  setSearchValue("");
                  handleChange("", filters);
                }}
              />
              <Divider />
            </div>
          )}
          <div className={styles.projectDropdown}>
            <ReactSelect
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
          <div className={styles.talentSectionHeader}>
            <Text size="b1" fontWeight="medium">
              Name (Count: {talentCount})
            </Text>
          </div>
          <div className="flex-col">
            {talentList?.map((talent, idx) => {
              const isLastElement = idx === talentList.length - 1;
              return (
                <div key={talent.id} id={talent.id}>
                  <TalentItem
                    ref={isLastElement ? setLastElement : undefined}
                    divStyle={styles.talentItem}
                    talentData={{
                      ...talent,
                      name: `${talent.fullNameWithExpBand} (${talent.employeeId})`,
                      role: talent?.role?.name,
                      showAllSkills: true,
                    }}
                  >
                    <MobileTalentInfo
                      userDetails={{
                        ...talent,
                        name: talent?.fullNameWithExpBand,
                      }}
                      showCompactProjectView
                      showCompactSkillView
                      criteria={talent}
                    />
                  </TalentItem>
                </div>
              );
            })}
          </div>
        </aside>
        <div className="flex-col text-center hidden-sm-down">
          <div className={styles.timelineMonthToggle}>
            <Button
              className="pa-0"
              onClick={() => {
                decrementMonth();
              }}
            >
              <img src={ArrowBlueFilled} alt="View previous month" />
            </Button>
            <Text size="b3" fontWeight="medium">
              {`${currentTimeline[0]?.month}, ${currentTimeline[0]?.year}`}
            </Text>
            <Button
              className="pa-0"
              onClick={() => {
                incrementMonth();
              }}
            >
              <img
                className={styles.arrowRight}
                src={ArrowBlueFilled}
                alt="view next month"
              />
            </Button>
          </div>
          <section
            style={{ backgroundSize }}
            className={`${styles.talentTimelineFilled} relative`}
          >
            <div style={{ gridTemplateColumns }}>
              <DatesInCurrentTimeline currentTimeline={currentTimeline} />
            </div>
            <AllocationWrapper style={wrapperStyle}>
              <div className={styles.emptyTimelineRow} />
            </AllocationWrapper>
            {talentList?.map((talent, talentIdx) => (
              <AllocationWrapper key={`${talentIdx}`} style={wrapperStyle}>
                <UserAllocation
                  month={month}
                  user={talent}
                  userIdx={talentIdx}
                  numberOfColumns={numberOfColumns}
                />
              </AllocationWrapper>
            ))}
            <AllocationWrapper style={wrapperStyle}>
              <div className={styles.emptyTimelineRow} />
            </AllocationWrapper>
          </section>
          <div className={`flex align-center ${styles.talentFooter}`}>
            <Legends />
            <div className="ml-auto col-xl-2">
              <ReactSelect
                placeholder="Select Function"
                options={dropdowns.function}
                value={filters.function}
                onChange={(value) => {
                  setFilters({
                    function: value,
                  });
                  handleChange(searchValue, { ...filters, function: value });
                }}
                menuPlacement="top"
              />
            </div>
            <div className={styles.statusFilter}>
              <ReactSelect
                placeholder="Select Status"
                options={dropdowns.status}
                value={filters.status}
                isMulti
                hideSelectedOptions={false}
                onChange={(value) => {
                  setFilters({
                    status: value,
                  });
                  handleChange(searchValue, { ...filters, status: value });
                }}
                menuPlacement="top"
                closeMenuOnSelect={false}
                components={{
                  Option: CheckboxOption,
                }}
              />
            </div>
          </div>
        </div>
        <MobileModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          showTitle
          title="Filtering &amp; Sorting Options"
          isFullScreen={false}
          showCloseBtn
        >
          <TalentFilters
            dropdowns={dropdowns}
            filters={filters}
            setFilters={setFilters}
            handleChange={handleChange}
          />

          <div className={`flex gap-20 ${styles.button}`}>
            <Button
              variant="primary"
              className="mt-16 col-sm-6"
              onClick={() => {
                setIsFilterOpen(false);
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="primary"
              className="mt-16 col-sm-6"
              onClick={() => {
                setFilters({ ...initialFilterState, status: [] });
                handleChange(searchValue, { ...initialFilterState, status: [] });
                setIsFilterOpen(false);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </MobileModal>
      </section>
    </React.Fragment>
  );
};

export default Talent;
