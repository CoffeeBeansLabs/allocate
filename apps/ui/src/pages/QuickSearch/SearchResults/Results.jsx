import { Button, Spinner, Text } from "@allocate-core/ui-components";
import React, { useEffect, useLayoutEffect } from "react";
import { shallow } from "zustand/shallow";

import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";

import AllocationWrapper from "../../../components/Timeline/AllocationWrapper";
import DatesInCurrentTimeline from "../../../components/Timeline/DatesInCurrentTimeline";
import Legends from "../../../components/Timeline/Legends";
import UserAllocation from "../../../components/Timeline/UserAllocation";
import { useCommonStore } from "../../../store/commonStore";
import { useSearchStore } from "../../../store/searchStore";
import RecommendationsRolesSection from "../../Projects/Timeline/RecommendationsRolesSection";
import styles from "../../Projects/Timeline/timeline.module.css";

const roleTypes = ["sameRole", "otherRoles"];

const Results = ({ isLoading, hideHeading }) => {
  const [month, incrementMonth, decrementMonth] = useSearchStore(
    (state) => [state.month, state.incrementMonth, state.decrementMonth],
    shallow,
  );

  const [currentTimeline, setCurrentTimeline] = useSearchStore(
    (state) => [state.currentTimeline, state.setCurrentTimeline],
    shallow,
  );
  const [lastPosition, setLastPosition] = useCommonStore(
    (state) => [state.lastPosition, state.setLastPosition],
    shallow,
  );

  const setLastElement = useSearchStore((state) => state.setLastElement, shallow);
  const recommendations = useSearchStore((state) => state.recommendations, shallow);

  const numberOfColumns = currentTimeline?.length;
  const backgroundSize = `${100 / numberOfColumns || 1}%`;
  const gridColumn = `1 / ${numberOfColumns + 1}`;
  const gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`;
  const wrapperStyle = { gridColumn, gridTemplateColumns };

  useEffect(() => {
    setCurrentTimeline(month);
  }, [month]);

  useLayoutEffect(() => {
    if (!lastPosition) return;
    const element = document.getElementById(lastPosition);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
    setLastPosition(null);
  }, [recommendations]);

  return (
    <section className={styles.timelineWrapper}>
      {isLoading ? <Spinner /> : null}
      <RecommendationsRolesSection
        recommendations={recommendations}
        roleTypes={roleTypes}
        setLastElement={setLastElement}
        isForQuickSearch
        hideHeading={hideHeading}
      />
      <div className="hidden-sm-down flex-col text-center">
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
          {roleTypes.map((type, typeIdx) => {
            return (
              <React.Fragment key={typeIdx}>
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
                <AllocationWrapper style={wrapperStyle}>
                  <div className={styles.emptyTimelineRow} />
                </AllocationWrapper>
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
  );
};

export default Results;
