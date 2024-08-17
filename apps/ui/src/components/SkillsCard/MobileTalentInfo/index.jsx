import { Rating, Text } from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { formatMonths, sortArrayOfObjects } from "../../../common/common";
import { SCOPES } from "../../../constants/roles";
import PermissionGate from "../../PermissionGate";
import styles from "../skillsCard.module.css";

const formatProjects = (project) => {
  return (
    <div className="flex-col" key={project?.id}>
      <Text size="b3" fontWeight="semibold">
        {project?.projectName}
      </Text>
      <div className="flex justify-between">
        <Text size="b3">
          <Text size="b3" fontWeight="medium">
            Allocation On :{" "}
          </Text>{" "}
          {getFormatedDate(project?.startDate)}
        </Text>
        <Text size="b3">
          <Text size="b3" fontWeight="medium">
            Allocation :{" "}
          </Text>{" "}
          {project?.utilization} %
        </Text>
      </div>
      <Text size="b3">
        <Text size="b3" fontWeight="medium">
          Allocation Till :{" "}
        </Text>{" "}
        {getFormatedDate(project?.endDate)}
      </Text>
    </div>
  );
};

const MobileTalentInfo = ({
  userDetails,
  showCompactSkillView = false,
  showCompactProjectView = false,
  showLeavesAndRequests = false,
  criteria,
}) => {
  const sortedSkills = sortArrayOfObjects(userDetails?.skills, {
    key: "rating",
    asc: false,
  });
  const sortedReleventSkills = criteria
    ? sortArrayOfObjects(
        userDetails?.skills.filter((skill) =>
          criteria?.skills.find((id) => id === skill.skillId),
        ),
        {
          key: "rating",
          asc: false,
        },
      )
    : [];
  const sortedOtherSkills = criteria
    ? sortArrayOfObjects(
        userDetails?.skills.filter(
          (skill) => !criteria?.skills.find((id) => id === skill.skillId),
        ),
        {
          key: "rating",
          asc: false,
        },
      )
    : [];

  const [showAllSkills, setShowAllSkills] = useState(false);
  const [talentSkills, setTalentSkills] = useState(
    showCompactSkillView ? sortedReleventSkills : sortedSkills,
  );

  useEffect(() => {
    if (!showCompactSkillView) {
      setTalentSkills(sortedSkills);
      return;
    }

    if (criteria) {
      showAllSkills
        ? setTalentSkills(sortedSkills)
        : setTalentSkills(sortedSkills.slice(0, 5));
    } else {
      showAllSkills
        ? setTalentSkills(sortedReleventSkills.concat(sortedOtherSkills))
        : setTalentSkills(sortedReleventSkills);
    }
  }, [showAllSkills]);

  const projects = userDetails?.projects || userDetails?.allocation;
  const leaves = userDetails?.leavePlans || userDetails?.leaves;
  return (
    <div>
      <Text size="b3">{`Exp - ${formatMonths(userDetails?.experienceMonths || 0)}`}</Text>
      <Text as="div" size="b3">
        Role - {userDetails?.role?.name || userDetails?.role}
      </Text>
      <PermissionGate
        scopes={[SCOPES.canViewLWD]}
        permittedElement={() =>
          userDetails?.lastWorkingDay && (
            <Text as="div" size="b3" className="error">
              LWD - {format(new Date(userDetails?.lastWorkingDay), "PP")}
            </Text>
          )
        }
      />

      <Link to={`/people/details/${userDetails.id}`}>
        <Text size="b4" fontWeight="medium" className={styles.moreDetailsLink}>
          More Details
        </Text>
      </Link>
      <hr className={styles.hr} />
      <div className={styles.skillCardItems}>
        {talentSkills?.map(({ skill: skillName = "", rating = 0 }, idx) => {
          return (
            <div key={`skill_${idx}`} className={styles.skillItem}>
              <Text size="b3" fontWeight="medium">
                {skillName}
              </Text>
              <Rating score={rating} />
            </div>
          );
        })}
      </div>
      {showCompactSkillView && (
        <div
          role="presentation"
          onClick={() => talentSkills.length !== 0 && setShowAllSkills((curr) => !curr)}
        >
          <Text
            size="b4"
            fontWeight="medium"
            className={styles.moreDetailsLink}
            style={{ color: talentSkills.length === 0 && "#a2a8b4" }}
          >
            View {showAllSkills ? "Less" : "More"}
          </Text>
        </div>
      )}
      <hr className={styles.hr} />
      <div className="pt-16">
        <Text size="b2" fontWeight="semibold">
          Projects
        </Text>
        {projects.map((proj) => {
          return showCompactProjectView ? (
            <div className="flex-col" key={proj.id}>
              <Text size="b3" fontWeight="semibold">
                {proj?.projectName}{" "}
                <Text size="b3" fontWeight="medium">
                  ({proj.utilization} %)
                </Text>
              </Text>
              <Text size="b3">
                {getFormatedDate(proj?.startDate)} - {getFormatedDate(proj?.endDate)}
              </Text>
            </div>
          ) : (
            formatProjects(proj)
          );
        })}
      </div>
      <hr className={styles.hr} />
      {showLeavesAndRequests && (
        <React.Fragment>
          <div className="flex-col pt-16">
            <Text size="b2" fontWeight="semibold">
              Upcoming Leaves
            </Text>
            {leaves
              .filter(
                (leave) =>
                  new Date(leave.fromDate) >= new Date() ||
                  new Date(leave.toDate) >= new Date(),
              )
              .map((leave, idx) => (
                <Text size="b3" key={`${leave.fromDate}_${leave.toDate}_${idx}`}>
                  {getFormatedDate(leave?.fromDate)} - {getFormatedDate(leave?.toDate)}
                </Text>
              ))}
          </div>
          <hr className={styles.hr} />
          <div className="flex-col pt-16">
            <Text size="b2" fontWeight="semibold">
              Requests
            </Text>
            {userDetails?.requests && userDetails?.requests.length > 0 ? (
              userDetails?.requests.map((proj) => formatProjects(proj))
            ) : (
              <Text size="b3">No requests</Text>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default React.memo(MobileTalentInfo);
