import { Button, Rating, Text } from "@allocate-core/ui-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import EditIcon from "/icons/editIcon.svg";

import { getUserSkillsIndustries } from "../../../api/skillPortal";
import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import styles from "./talentDetails.module.css";

const SKILL_COUNT_INCREMENT = 5;

const Skills = ({ title = "", data = [], talentID, handleEdit, setRefetch }) => {
  const { id: talentId } = useParams();
  const [areAllSkillsDisplayed, setAreAllSkillsDisplayed] = useState(false);
  const [shownSkillsLength, setShownSkillsLength] = useState(SKILL_COUNT_INCREMENT);
  const [skills, setSkills] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [skillsetValues, setSkillsetValues] = useState([]);

  useEffect(() => {
    if (talentID) {
      getUserSkillsIndustries(talentID)
        .then((response) => setSkillsetValues(response.user.skills))
        .catch((errResponse) => toast(errResponse?.data?.detail));
    }
  }, [talentID]); // Added `talentID` as a dependency

  useEffect(() => {
    setAreAllSkillsDisplayed(data.length === shownSkillsLength);
    setSkills(data.slice(0, shownSkillsLength));
  }, [shownSkillsLength, data]);

  const handleSave = () => {
    handleEdit(talentId, {
      skills: skillsetValues
        .filter((skill) => skill.rating > 0)
        .map((skill) => ({
          skillName: skill.skillName,
          rating: skill.rating,
        })),
    })
      .then(() => setRefetch(true))
      .catch((errorResponse) => toast(errorResponse?.data?.detail));
    setIsEditMode(false);
  };

  const sortedSkillsetValues = [...skillsetValues].sort(
    (a, b) => b.rating - a.rating || a.skillName?.localeCompare(b.skillName),
  );

  const toggleShowMore = () => {
    setShownSkillsLength((current) =>
      current === data.length
        ? SKILL_COUNT_INCREMENT
        : Math.min(current + SKILL_COUNT_INCREMENT, data.length),
    );
  };

  return (
    <div className={`row pt-16 ${isEditMode ? "flex-col" : ""}`}>
      <div className="col-xl-4 flex">
        <Text size="b2" fontWeight="semibold" className="color-CadetGrey">
          {title}
        </Text>
        <PermissionGate
          scopes={[SCOPES.canUpdatePeopleDetails]}
          permittedElement={() => (
            <div className={`ml-auto ${isMobile && !isEditMode ? "show" : "hide"}`}>
              <img
                src={EditIcon}
                alt="Skills Edit Icon"
                className={styles.editIcon}
                role="presentation"
                onClick={() => setIsEditMode(true)}
              />
            </div>
          )}
        />
      </div>
      {isEditMode ? (
        <div className={styles.inputContainer}>
          <div className={`${styles.skillContainer} flex-col gap-10 pt-20`}>
            {sortedSkillsetValues.map((skillItem, idx) => (
              <div
                className={`flex justify-between align-center ${styles.skill}`}
                key={`${skillItem.id}_${skillItem.skillName}`}
              >
                <Text size="b2" fontWeight="medium">
                  {skillItem.skillName}
                </Text>
                <Rating
                  score={skillItem.rating}
                  isEditable={true}
                  handleOnChange={(rating) => {
                    const modifiedSkills = [...skillsetValues];
                    const skillToChange = { ...skillItem, rating };
                    modifiedSkills[idx] = skillToChange;
                    setSkillsetValues(modifiedSkills);
                  }}
                />
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            className={`ml-auto mt-16 ${styles.saveButton}`}
          >
            Save
          </Button>
        </div>
      ) : (
        <div className="col-xl-8 flex-col">
          <PermissionGate
            scopes={[SCOPES.canUpdatePeopleDetails]}
            permittedElement={() => (
              <div className={`ml-auto ${!isMobile ? "show" : "hide"}`}>
                <img
                  src={EditIcon}
                  alt="Edit Icon"
                  className={styles.editIcon}
                  role="presentation"
                  onClick={() => setIsEditMode(true)}
                />
              </div>
            )}
          />
          <div className={styles.skillCardItems}>
            {skills?.map(({ skill: skillName = "", rating = 0 }, idx) => (
              <div key={`skill_${idx}`} className={styles.skillItem}>
                <Text size="b1" fontWeight="medium">
                  {skillName}
                </Text>
                <Rating score={rating} />
              </div>
            ))}
          </div>
          {skills.length >= SKILL_COUNT_INCREMENT && (
            <Text
              size="b2"
              fontWeight="medium"
              className={styles.showMore}
              onClick={toggleShowMore}
            >
              {areAllSkillsDisplayed ? "Show Less" : "Show More"}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default Skills;
