import { Button, Heading, Text } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useState } from "react";

import ChevronIcon from "/icons/chevron.svg";

import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import MobileTalentInfo from "../../../components/SkillsCard/MobileTalentInfo";
import TalentItem from "../../../components/TalentItem";
import AllocationWrapper from "../../../components/Timeline/AllocationWrapper";
import { SCOPES } from "../../../constants/roles";
import PositionCriteria from "../components/PositionCriteria";
import styles from "./timeline.module.css";

const RecommendationsRolesSection = ({
  recommendations,
  roleTypes,
  setLastElement,
  setSelectedTalent,
  setIsAddToProjectModalOpen,
  isForQuickSearch = false,
  hideHeading = false,
}) => {
  const [isPositionCriteriaOpen, setIsPositionCriteriaOpen] = useState(false);

  return (
    <aside className={styles.rolesSectionWrapper}>
      <div className={styles.matchedTalentContainer}>
        <div className={`${isForQuickSearch ? "hide" : "show"} ${styles.positionCard}`}>
          <div className="flex align-center">
            <Text as="div" size="b1" fontWeight="medium">
              Position
            </Text>
            {isMobile && (
              <img
                src={ChevronIcon}
                alt="chevron icon"
                role="presentation"
                onClick={() => setIsPositionCriteriaOpen((currState) => !currState)}
                className={`ml-auto ${isPositionCriteriaOpen ? styles.rotate180deg : ""}`}
              />
            )}
          </div>
          <div
            className={
              isMobile
                ? `${isPositionCriteriaOpen ? "show px-20" : "hide"}`
                : `${styles.positionDetailsBG} card-1`
            }
          >
            <PositionCriteria criteria={recommendations?.criteria} />
          </div>
        </div>
        {roleTypes.map((type, idx) => {
          return (
            <React.Fragment key={`${type}_${idx}`}>
              <AllocationWrapper
                style={{ placeItems: "baseline", padding: "10px 20px 0" }}
              >
                <div className={isMobile ? "flex gap-10" : "flex-col"}>
                  <Heading
                    size="h6"
                    fontWeight="bold"
                    className={hideHeading && type === "otherRoles" ? "hide" : "show"}
                  >
                    {isForQuickSearch ? "Search Results" : "Recommendations"}
                  </Heading>
                  <Text
                    as="div"
                    size="b1"
                    fontWeight="bold"
                    className={hideHeading ? "hide" : "show"}
                  >
                    ({recommendations[type].displayName})
                  </Text>
                </div>
              </AllocationWrapper>
              {Object.keys(recommendations[type]?.matches)?.map((matchPercent, idx) => {
                return (
                  <div key={idx} className={styles.matchedTalentCard}>
                    {recommendations[type].matches[matchPercent].map((talent, idx2) => {
                      const isLastElement =
                        idx === Object.keys(recommendations[type]?.matches).length - 1 &&
                        idx2 === recommendations[type].matches[matchPercent]?.length - 1;

                      return (
                        <div key={idx2}>
                          <TalentItem
                            ref={isLastElement ? setLastElement : undefined}
                            divStyle={`flex gap-10 ${styles.leftPanelItem}`}
                            isQuickSearch={isForQuickSearch}
                            talentData={{
                              id: talent?.id,
                              name: `${matchPercent} ${talent?.fullNameWithExpBand}`,
                              ...talent,
                            }}
                            buttonComponent={
                              !isForQuickSearch && (
                                <PermissionGate
                                  scopes={[SCOPES.canAddTalent, SCOPES.canRequestTalent]}
                                  showPermittedElement
                                  permittedElement={(hasPermission) => (
                                    <Button
                                      variant="secondary"
                                      className={`ml-auto ${styles.addToProjectBtn}`}
                                      onClick={() => {
                                        setSelectedTalent({
                                          ...talent,
                                        });
                                        setIsAddToProjectModalOpen(true);
                                      }}
                                      disabled={!hasPermission}
                                    >
                                      +
                                    </Button>
                                  )}
                                />
                              )
                            }
                          >
                            <MobileTalentInfo
                              userDetails={talent}
                              showCompactSkillView
                              showCompactProjectView={isForQuickSearch}
                              showLeavesAndRequests={!isForQuickSearch}
                              criteria={recommendations.criteria}
                            />
                          </TalentItem>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
};

RecommendationsRolesSection.propTypes = {
  recommendations: PropTypes.shape({
    criteria: PropTypes.shape({
      utilization: PropTypes.number,
    }),
    [PropTypes.string]: PropTypes.shape({
      displayName: PropTypes.string,
      matches: PropTypes.objectOf(
        PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            fullNameWithExpBand: PropTypes.string,
          }),
        ),
      ),
    }),
  }).isRequired,
  roleTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setLastElement: PropTypes.func.isRequired,
  setSelectedTalent: PropTypes.func.isRequired,
  setIsAddToProjectModalOpen: PropTypes.func.isRequired,
  isForQuickSearch: PropTypes.bool,
  hideHeading: PropTypes.bool,
};

export default RecommendationsRolesSection;
