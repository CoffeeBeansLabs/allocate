import { Button, Heading, Rating, Text } from "@allocate-core/ui-components";
import React from "react";

import { isMobile } from "../../common/common";
import styles from "./skillForm.module.css";

const UpdateSkillForm = ({
  name,
  hasIndustryMappingPermission,
  hasUserExperiencePermissions,
  skillsetValues,
  setSkillsetValues,
  onBack,
  onNext,
  onSubmit,
}) => {
  return (
    <div className={styles.skillsetSection}>
      <Heading size="h4" fontWeight="bold" className={styles.title}>
        Proficiency Mapping Form
      </Heading>
      <div className={styles.form}>
        <Text size="b2" fontWeight="medium" className={styles.instruction}>
          Hi {name},
          <ol>
            <li>
              Please rate the skills you have on a scale of 1 to 5, with 5 being the
              highest. This information will be used to allocate projects, schedule
              interviews, etc...
            </li>
            <li>Please fill in the ratings for as many skills as applicable.</li>
          </ol>
        </Text>
        <div className={`${styles.skillContainer} flex-col gap-10 pt-20`}>
          {skillsetValues
            ?.sort(
              (a, b) => b.rating - a.rating || a.skillName.localeCompare(b.skillName),
            )
            ?.map((skillItem, idx) => (
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
                    const skillToChange = { ...skillItem };

                    skillToChange["rating"] = rating;
                    modifiedSkills[idx] = skillToChange;

                    setSkillsetValues(modifiedSkills);
                  }}
                />
              </div>
            ))}
        </div>
        <div className={`flex align-center gap-20 ${styles.nextBtn}`}>
          {hasUserExperiencePermissions && (
            <Button
              variant="secondary"
              type="submit"
              className={`${isMobile ? "col-sm-6" : "ml-auto"}`}
              onClick={onBack}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            className={`${
              isMobile
                ? "col-sm-12"
                : hasUserExperiencePermissions
                  ? undefined
                  : "ml-auto"
            }`}
            onClick={hasIndustryMappingPermission ? onNext : onSubmit}
          >
            {hasIndustryMappingPermission ? "Next" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSkillForm;
