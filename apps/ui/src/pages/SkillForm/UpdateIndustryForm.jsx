import { Button, Heading, MultiValueContainer, Text } from "@allocate-core/ui-components";
import React from "react";

import { isMobile } from "../../common/common";
import styles from "./skillForm.module.css";

const UpdateIndustryForm = ({
  name,
  onBack,
  onSubmit,
  industryValues,
  setIndustryValues,
  hasProficiencyMappingPermission,
  hasUserExperiencePermissions,
  industryDropdown,
}) => {
  return (
    <section>
      <Heading size="h4" fontWeight="bold" className={styles.title}>
        Industry Experience Form
      </Heading>
      <div className={styles.form}>
        <Text size="b2" fontWeight="medium">
          {name}, <br />
          Kindly select the industries in which you have worked before!
        </Text>
        <div className="flex-col gap-10 pt-20">
          <Text size="b1" fontWeight="medium">
            Enter Industries:
          </Text>
          <MultiValueContainer
            variant="select"
            options={industryDropdown}
            values={industryValues}
            onDelete={(valueToRemove) =>
              setIndustryValues((current) =>
                current.filter((item) => item.value !== valueToRemove),
              )
            }
            onAdd={(valueToAdd) =>
              setIndustryValues((current) =>
                !current.some((item) => item.value === valueToAdd.value)
                  ? current.concat(valueToAdd)
                  : current,
              )
            }
          />
        </div>
        <div className={`flex align-center gap-20 ${styles.nextBtn}`}>
          {hasProficiencyMappingPermission || hasUserExperiencePermissions ? (
            <Button
              variant="secondary"
              type="submit"
              className={`${isMobile ? "col-sm-6" : "ml-auto"}`}
              onClick={onBack}
            >
              Back
            </Button>
          ) : null}
          <Button
            variant="primary"
            type="submit"
            className={`${isMobile && "col-sm-6"} ${
              hasProficiencyMappingPermission || hasUserExperiencePermissions
                ? undefined
                : "ml-auto"
            }
            `}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpdateIndustryForm;
