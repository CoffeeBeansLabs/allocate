import { Button, Menu, Modal, Spinner, Text } from "@allocate-core/ui-components";
import { getCurrentTimeline } from "@allocate-core/util-data-values";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";

import {
  getCitiesOfCountryOfTalents,
  getCountriesOfTalents,
} from "../../../api/dropdowns";
import { getProjectById, talentSearch } from "../../../api/projects";
import { capitalizeWords, debounce, isMobile } from "../../../common/common";
import MobileModal from "../../../components/MobileModal/MobileModal";
import AllocationWrapper from "../../../components/Timeline/AllocationWrapper";
import DatesInCurrentTimeline from "../../../components/Timeline/DatesInCurrentTimeline";
import Legends from "../../../components/Timeline/Legends";
import UserAllocation from "../../../components/Timeline/UserAllocation";
import { useCommonStore } from "../../../store/commonStore";
import { useRecommendationStore } from "../../../store/recommendationStore";
import AddToProjectForm from "../components/AddToProjectForm";
import RecommendationsHeader from "./RecommendationsHeader";
import RecommendationsRolesSection from "./RecommendationsRolesSection";
import styles from "./timeline.module.css";

const roleTypes = ["sameRole", "otherRoles"];

const currentDate = new Date();
const currentMonth = currentDate.getMonth();

export const fetchProjectDetails = async (
  getProjectId,
  setSelectedCountry,
  setSelectedCities,
  fetchData,
) => {
  const project = await getProjectDetailsById(getProjectId);

  if (isCountryInTalents(project?.country)) {
    if (await isCityInCountry(project?.country, project?.city)) {
      selectProjectLocation(project, setSelectedCountry, setSelectedCities);
      fetchData(1, false, null, [capitalizeWords(project?.city)]);
      return;
    }
  }

  fetchData(1, false);
};

const getProjectDetailsById = async (getProjectId) => {
  const { project } = await getProjectById(getProjectId);
  return project;
};

const isCountryInTalents = async (country) => {
  const countriesData = await getCountriesOfTalents();
  return countriesData.countries.some((c) => c?.toLowerCase() === country?.toLowerCase());
};

const isCityInCountry = async (country, city) => {
  const citiesData = await getCitiesOfCountryOfTalents(country);
  return citiesData?.cities?.some((c) => c?.toLowerCase() === city?.toLowerCase());
};

const selectProjectLocation = (project, setSelectedCountry, setSelectedCities) => {
  setSelectedCountry({
    value: project?.country,
    label: project?.country,
  });

  setSelectedCities([
    {
      value: capitalizeWords(project?.city),
      label: capitalizeWords(project?.city),
    },
  ]);
};

const Recommendations = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [month, setMonth] = useState(currentMonth);
  const [currentTimeline, setCurrentTimeline] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);

  const numberOfColumns = currentTimeline?.length;
  const backgroundSize = `${100 / numberOfColumns || 1}%`;
  const gridColumn = `1 / ${numberOfColumns + 1}`;
  const gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`;
  const wrapperStyle = { gridColumn, gridTemplateColumns };

  const [lastElement, setLastElement] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, incrementPageNumber, setPageNumber] = useRecommendationStore(
    (state) => [state.pageNumber, state.incrementPageNumber, state.setPageNumber],
    shallow,
  );
  const [selectedTalent, setSelectedTalent] = useState({});
  const [isAddedToProject, setIsAddedToProject] = useState(false);
  const [showRelatedSuggestions, setShowRelatedSuggestions] = useRecommendationStore(
    (state) => [state.showRelatedSuggestions, state.setShowRelatedSuggestions],
    shallow,
  );
  const [isAddToProjectModalOpen, setIsAddToProjectModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useRecommendationStore(
    (state) => [state.searchValue, state.setSearchValue],
    shallow,
  );
  const [recommendations, setRecommendations] = useRecommendationStore(
    (state) => [state.recommendations, state.setRecommendations],
    shallow,
  );
  const setStoreForSearch = useRecommendationStore(
    (state) => state.setStoreForSearch,
    shallow,
  );
  const lastPosition = useCommonStore((state) => state.lastPosition, shallow);
  const [formDirty, setFormDirty] = useState(false);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        incrementPageNumber();
      }
    }),
  );

  const fetchData = (pageNumber, showRelatedSuggestions, searchQuery, cityCodes) => {
    setIsLoading(true);
    talentSearch({
      position: params?.positionId,
      relatedSuggestions: showRelatedSuggestions,
      page: pageNumber,
      search: searchQuery,
      locations: cityCodes,
    })
      .then((response) => {
        setRecommendations(response);
      })
      .catch((errorResponse) => {
        toast.error(errorResponse?.data?.detail);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const debouncedHandler = useCallback(
    debounce(
      (searchQuery, cityCodes) =>
        fetchData(pageNumber, showRelatedSuggestions, searchQuery, cityCodes),
      500,
    ),
    [showRelatedSuggestions, pageNumber],
  );

  const resetRecommendations = () => {
    setShowRelatedSuggestions(false);
    setPageNumber(1);
  };

  useEffect(() => {
    if (selectedCountry?.value && !selectedCities?.length) {
      toast.error("Please select a City");
    }
  }, [selectedCountry]);

  useEffect(() => {
    const maxPageCount = showRelatedSuggestions
      ? Math.ceil(recommendations.otherRoles.count / 10)
      : Math.ceil(recommendations.sameRole.count / 10);

    const cityCodes = selectedCities?.map((city) => city?.value);
    if (pageNumber <= maxPageCount) {
      if (!searchValue) {
        if (pageNumber === 1 && !showRelatedSuggestions) return;
        fetchData(pageNumber, showRelatedSuggestions, null, cityCodes);
      } else {
        debouncedHandler(searchValue, cityCodes);
      }
    } else if (!showRelatedSuggestions) {
      setTimeout(() => {
        setShowRelatedSuggestions(true);
        setPageNumber(1);
      }, 400);
    }
  }, [pageNumber, showRelatedSuggestions, searchValue]);

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
    setCurrentTimeline(getCurrentTimeline(month));
  }, [month]);

  const closeAddToProjectModal = () => {
    setSelectedTalent({});
    setIsAddedToProject(true);
    setIsAddToProjectModalOpen(false);
  };

  useEffect(() => {
    if (selectedCities?.length === 0 && !selectedCountry?.value) return;
    setStoreForSearch();
  }, [selectedCities?.length, selectedCountry?.value]);

  useLayoutEffect(() => {
    if (!lastPosition) return;
    const element = document.getElementById(lastPosition);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [recommendations]);

  return (
    <React.Fragment>
      {isLoading ? <Spinner /> : null}
      <RecommendationsHeader
        projectId={params?.projectId}
        value={searchValue}
        setSearchValue={(query) => {
          setSearchValue(query);
          setStoreForSearch();
        }}
        selectedCity={selectedCities}
        selectedCountry={selectedCountry}
        setSelectedCity={setSelectedCities}
        setSelectedCountry={setSelectedCountry}
        fetchData={fetchData}
        setStoreForSearch={setStoreForSearch}
        resetRecommendations={resetRecommendations}
      />
      <section className={styles.timelineWrapper}>
        <RecommendationsRolesSection
          recommendations={recommendations}
          roleTypes={roleTypes}
          isAddedToProject={isAddedToProject}
          setLastElement={setLastElement}
          setSelectedTalent={setSelectedTalent}
          setIsAddToProjectModalOpen={setIsAddToProjectModalOpen}
        />
        <div className="hidden-sm-down flex-col text-center">
          <div className={styles.timelineMonthToggle}>
            <Button
              className="pa-0"
              onClick={() => {
                setMonth((current) => current - 1);
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
                setMonth((current) => current + 1);
              }}
            >
              <img
                className={styles.arrowRight}
                src={ArrowBlueFilled}
                alt="view next month"
              />
            </Button>
          </div>
          <div className="absolute" style={{ top: 8, right: 24 }}>
            <Menu menuClassName={styles.right0}>
              <Button className="pa-0" onClick={() => {}}>
                Options
              </Button>
            </Menu>
          </div>

          <section
            style={{ backgroundSize }}
            className={`${styles.talentTimelineFilled} relative`}
          >
            <div style={{ gridTemplateColumns }}>
              <DatesInCurrentTimeline currentTimeline={currentTimeline} />
            </div>
            {roleTypes.map((type, typeIdx) => {
              return (
                <React.Fragment key={typeIdx}>
                  <AllocationWrapper style={wrapperStyle}>
                    <div className={styles.emptyTimelineRow} />
                  </AllocationWrapper>
                  {Object.keys(recommendations[type].matches)?.map(
                    (matchPercent, matchIdx) => {
                      return (
                        <React.Fragment key={matchIdx}>
                          {recommendations[type].matches[matchPercent].map(
                            (talent, talentIdx) => (
                              <AllocationWrapper
                                key={`${matchIdx}_${talentIdx}`}
                                style={wrapperStyle}
                              >
                                <UserAllocation
                                  month={month}
                                  user={talent}
                                  userIdx={talentIdx}
                                  posIndex={matchIdx}
                                  type="allocation"
                                  numberOfColumns={numberOfColumns}
                                />
                              </AllocationWrapper>
                            ),
                          )}
                        </React.Fragment>
                      );
                    },
                  )}
                </React.Fragment>
              );
            })}
          </section>
          <Legends
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#FFFFFF",
              zIndex: 35,
            }}
          />
        </div>
      </section>
      {isMobile ? (
        <MobileModal
          isOpen={isAddToProjectModalOpen}
          onClose={closeAddToProjectModal}
          showTitle={true}
          isFullScreen={false}
          title="Add to Project"
        >
          <AddToProjectForm
            onSubmit={() => {
              closeAddToProjectModal();
              navigate(`/projects/timeline/${params.projectId}`);
            }}
            criteria={recommendations?.criteria}
            user={selectedTalent}
            params={params}
          />
        </MobileModal>
      ) : (
        <Modal
          isOpen={isAddToProjectModalOpen}
          onClose={closeAddToProjectModal}
          title="Add to Project"
          showCloseBtn
          showOnCloseAlert={formDirty}
          preventCloseOnOutsideClick={true}
          isMobile={isMobile}
        >
          <AddToProjectForm
            onSubmit={() => {
              closeAddToProjectModal();
              navigate(`/projects/timeline/${params.projectId}`);
            }}
            criteria={recommendations?.criteria}
            user={selectedTalent}
            params={params}
            setFormDirty={setFormDirty}
          />
        </Modal>
      )}
    </React.Fragment>
  );
};

export default Recommendations;
