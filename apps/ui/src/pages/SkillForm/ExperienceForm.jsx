import { Button, FormikInput, Heading } from "@allocate-core/ui-components";
import { Form, Formik } from "formik";
import React from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { updateUserExperience } from "../../api/skillPortal";
import { isMobile } from "../../common/common";
import styles from "./skillForm.module.css";

const validationSchema = Yup.object().shape({
  careerStartDate: Yup.date()
    .required("Select Date")
    .max(new Date(), "Date cannot be in the future"),
  careerBreakMonths: Yup.number(),
});

const ExperienceForm = ({
  userId,
  experienceValues,
  setExperienceValues = () => {},
  hasIndustryMappingPermission,
  hasProficiencyMappingPermission,
  onNext,
  onSubmit,
}) => {
  const handleSubmit = (values) => {
    const payload = {
      careerStartDate: `${values.careerStartDate?.year}-${values.careerStartDate?.month}-${values.careerStartDate?.day}`,
      careerBreakMonths: Number(values.careerBreakMonths),
    };

    updateUserExperience(userId, payload)
      .then(() =>
        hasIndustryMappingPermission || hasProficiencyMappingPermission
          ? onNext()
          : onSubmit(),
      )
      .catch((errorResponse) => toast.error(errorResponse?.data?.detail));
  };

  return (
    <div className="">
      <Heading size="h4" fontWeight="bold" className={styles.title}>
        Experience Form
      </Heading>
      <div className={styles.form}>
        <Formik
          enableReinitialize
          onSubmit={handleSubmit}
          initialValues={{ ...experienceValues }}
          validationSchema={validationSchema}
        >
          {({ setFieldValue }) => (
            <Form noValidate>
              <div className="col-xl-12 flex-col gap-40">
                <FormikInput
                  name="careerStartDate"
                  label="When did you start with your work experience?"
                  variant="date"
                  onChange={(value) => {
                    if (value) {
                      setFieldValue("careerStartDate", value);
                      setExperienceValues((current) => ({
                        ...current,
                        careerStartDate: value,
                      }));
                    }
                  }}
                />
                <FormikInput
                  name="careerBreakMonths"
                  label="Career Break (if any, in months)"
                  type="number"
                  onChange={(e) => {
                    const newValue = e.target?.value || "";
                    setFieldValue("careerBreakMonths", newValue);
                    setExperienceValues((current) => ({
                      ...current,
                      careerBreakMonths: newValue,
                    }));
                  }}
                />
              </div>
              <div className={`flex align-center gap-20 pt-20 ${styles.nextBtn}`}>
                <Button
                  variant="primary"
                  type="submit"
                  className={`${isMobile ? "col-sm-12" : "ml-auto"}`}
                >
                  {hasIndustryMappingPermission || hasProficiencyMappingPermission
                    ? "Next"
                    : "Submit"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExperienceForm;
