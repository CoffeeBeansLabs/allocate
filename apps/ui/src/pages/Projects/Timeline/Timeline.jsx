import { Button, Menu, Text } from "@allocate-core/ui-components";
import { getCurrentTimeline } from "@allocate-core/util-data-values";
import React, { useEffect, useState } from "react";

import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";

import AllocationWrapper from "../../../components/Timeline/AllocationWrapper";
import DatesInCurrentTimeline from "../../../components/Timeline/DatesInCurrentTimeline";
import UserAllocation from "../../../components/Timeline/UserAllocation";
import styles from "./timeline.module.css";

const currentDate = new Date();
const currentMonth = currentDate.getMonth();

const Timeline = ({ timelineData, setTimelineMonth }) => {
  const [month, setMonth] = useState(currentMonth);
  const [currentTimeline, setCurrentTimeline] = useState([]);

  useEffect(() => {
    setCurrentTimeline(getCurrentTimeline(month));
    setTimelineMonth(month);
  }, [month]);

  const numberOfColumns = currentTimeline?.length;
  const backgroundSize = `${100 / numberOfColumns || 1}%`;
  const gridColumn = `1 / ${numberOfColumns + 1}`;
  const gridTemplateColumns = `repeat(${numberOfColumns}, 1fr)`;

  const wrapperStyle = { gridColumn, gridTemplateColumns };

  return (
    <React.Fragment>
      <div className={`${styles.timelineMonthToggle} hidden-sm-down`}>
        <Button className="pa-0" onClick={() => setMonth((val) => val - 1)}>
          <img src={ArrowBlueFilled} alt="View previous month" />
        </Button>
        <Text size="b3" fontWeight="medium">
          {`${currentTimeline[0]?.month}, ${currentTimeline[0]?.year}`}
        </Text>
        <Button className="pa-0" onClick={() => setMonth((val) => val + 1)}>
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
        className={`${styles.talentTimelineFilled} relative hidden-sm-down`}
      >
        <div style={{ gridTemplateColumns }}>
          <DatesInCurrentTimeline currentTimeline={currentTimeline} />
        </div>

        {timelineData?.roles?.map((role, roleIdx) => {
          return (
            <React.Fragment key={`${role.roleName}_${roleIdx}`}>
              <AllocationWrapper style={wrapperStyle}>
                <div className={styles.emptyTimelineRow} />
              </AllocationWrapper>
              {role?.positions?.map((position, posIndex) => {
                return (
                  <React.Fragment key={posIndex}>
                    {position?.users?.length
                      ? position?.users.map((user, userIdx) => (
                          <React.Fragment key={`${posIndex}_${userIdx}`}>
                            <AllocationWrapper style={wrapperStyle}>
                              <UserAllocation
                                user={user}
                                month={month}
                                userIdx={userIdx}
                                posIndex={posIndex}
                                type="projects"
                                numberOfColumns={numberOfColumns}
                              />
                            </AllocationWrapper>
                            {user?.requests?.length > 0 ? (
                              <AllocationWrapper>
                                <div className={styles.emptyTimelineRow} />
                              </AllocationWrapper>
                            ) : null}
                          </React.Fragment>
                        ))
                      : null}
                    <AllocationWrapper style={wrapperStyle}>
                      <div className={styles.emptyTimelineRow} />
                    </AllocationWrapper>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </section>
    </React.Fragment>
  );
};

export default Timeline;
