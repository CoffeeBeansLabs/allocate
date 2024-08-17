import { Rating, Text } from "@allocate-core/ui-components";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatMonths, sortArrayOfObjects } from "../../common/common";
import { SCOPES } from "../../constants/roles";
import { useCommonStore } from "../../store/commonStore";
import PermissionGate from "../PermissionGate";
import styles from "./skillsCard.module.css";

const SkillsCard = ({
  id,
  name,
  skills = [],
  experienceMonths,
  lastWorkingDay,
  role,
  isOverUtilized,
}) => {
  const [skillSet, setSkillSet] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const setLastPosition = useCommonStore((state) => state.setLastPosition);
  const navigate = useNavigate();

  useEffect(() => {
    const skillsToSort = showMore ? skills : skills?.slice(0, 5);
    setSkillSet(sortArrayOfObjects(skillsToSort, { key: "rating", asc: false }));
  }, [showMore, skills]);

  return (
    <div
      className={`relative ${styles.skillsCardTrigger}`}
      onMouseLeave={() => setShowMore(false)}
    >
      <div
        className={`flex gap-10 ${styles.talentName}`}
        id={id}
        role="presentation"
        onClick={() => {
          setLastPosition(id);
          navigate(`/people/details/${id}`);
        }}
      >
        <Text
          as="div"
          size="b2"
          fontWeight="medium"
          className={isOverUtilized ? "error" : ""}
        >
          {name}
        </Text>
      </div>
      <div
        className={`hidden-sm-down card-1 ${styles.skillsCard}`}
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        <Text size="b2" fontWeight="semibold">
          {`Exp - ${formatMonths(experienceMonths || 0)}`}
        </Text>
        <Text as="div" size="b3">
          Role - {role}
        </Text>
        <PermissionGate
          scopes={[SCOPES.canViewLWD]}
          permittedElement={() => (
            <Text
              as="div"
              size="b3"
              className={`error ${lastWorkingDay ? "show" : "hide"}`}
            >
              LWD - {lastWorkingDay && format(new Date(lastWorkingDay), "PP")}
            </Text>
          )}
        />

        <hr className={styles.hr} />
        <div className={styles.skillCardItems}>
          {skillSet?.map(({ skill: skillName = "", rating = 0 }, idx) => {
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
        <Text
          size="b2"
          fontWeight="medium"
          className={styles.moreDetailsLink}
          style={{ color: skillSet.length === 0 && "#a2a8b4" }}
          onClick={(e) => {
            e.stopPropagation();
            skillSet.length !== 0 && setShowMore((current) => !current);
          }}
        >
          {showMore ? "Show Less" : "Show All Skills"}
        </Text>
      </div>
    </div>
  );
};

export default React.memo(SkillsCard);
