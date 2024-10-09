import { FormikInput, FormikReactSelect } from "@allocate-core/ui-components";
import { blockInvalidNumberInput } from "@allocate-core/util-data-values";
import { startOfDay } from "date-fns";
import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import * as Yup from "yup";
import { shallow } from "zustand/shallow";

import { useSearchStore } from "../../../store/searchStore";
import styles from "./searchResults.module.css";

const validationSchema = Yup.object().shape({
  position: Yup.object().shape({
    skills: Yup.array().of(Yup.object()).min(1, "Select at least 1 skill"),
    experienceRangeStart: Yup.object().nullable(),
    experienceRangeEnd: Yup.object()
      .test("is-greater", "To is less than From", function (experienceRangeEnd) {
        const { experienceRangeStart } = this.parent;
        if (experienceRangeStart?.value && experienceRangeEnd?.value)
          return experienceRangeEnd?.value >= experienceRangeStart?.value;

        return true;
      })
      .nullable(),
    dateValues: Yup.array().nullable(),
    utilization: Yup.number()
      .min(5, "Minimum is  5%")
      .max(100, "Maximum is 100%")
      .nullable(),
  }),
});
const debounced = {};
const ResultFilter = ({ handleChange }) => {
  const positionValues = useSearchStore((state) => state.positionValues, shallow);
  const dropdowns = useSearchStore((state) => state.dropdowns, shallow);
  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={{ position: { ...positionValues } }}
      validateOnBlur
    >
      {({ setFieldValue, setFieldTouched }) => {
        const handleInstantTouch = (field) => {
          if (debounced[field]) {
            clearTimeout(debounced[field]);
          }
          const debouncedId = setTimeout(() => setFieldTouched(field, true, true), 500);
          debounced[field] = debouncedId;
        };

        useEffect(() => {
          handleInstantTouch("position.skills");
          handleInstantTouch("position.experienceRangeEnd");
          handleInstantTouch("position.utilization");
        }, [positionValues]);

        return (
          <Form noValidate>
            <div className={`flex align-items-end gap-10 ${styles.positionFilter}`}>
              <div className="col-xl-3 px-0 ml-auto">
                <FormikReactSelect
                  required
                  name="position.skills"
                  label="Skillset *"
                  placeholder="Select skillset"
                  options={dropdowns.skills}
                  isClearable={false}
                  isMulti
                  onChange={(value) => {
                    setFieldValue("position.skills", value, true);
                    handleChange("skills", value);
                  }}
                  value={positionValues?.skills}
                />
              </div>

              <div className="flex gap-10 hidden-md-up">
                <div className="col-xl-1 px-0">
                  <FormikReactSelect
                    name="position.experienceRangeStart"
                    label="Exp: From"
                    placeholder="From"
                    isClearable={true}
                    options={dropdowns.yoeFrom}
                    onChange={(value) => {
                      setFieldValue("position.experienceRangeStart", value, true);
                      handleChange("experienceRangeStart", value);
                    }}
                    value={positionValues?.experienceRangeStart}
                  />
                </div>
                <div className="col-xl-1 px-0">
                  <FormikReactSelect
                    name="position.experienceRangeEnd"
                    label="Exp: To"
                    placeholder="To"
                    isClearable={true}
                    options={dropdowns.yoeFrom}
                    onChange={(value) => {
                      setFieldValue("position.experienceRangeEnd", value, true);
                      handleChange("experienceRangeEnd", value);
                    }}
                    value={positionValues?.experienceRangeEnd}
                  />
                </div>
                <div className="col-xl-1 px-0">
                  <FormikInput
                    name="position.utilization"
                    label="Availability"
                    placeholder="Enter %"
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    onKeyDown={blockInvalidNumberInput}
                    onChange={(value) => {
                      setFieldValue("position.utilization", value || "", true);
                      handleChange("utilization", value || "");
                    }}
                    value={positionValues?.utilization}
                  />
                </div>
              </div>

              <div className="hidden-sm-down">
                <FormikReactSelect
                  name="position.experienceRangeStart"
                  label="Exp: From"
                  placeholder="From"
                  isClearable={true}
                  options={dropdowns.yoeFrom}
                  onChange={(value) => {
                    setFieldValue("position.experienceRangeStart", value, true);
                    handleChange("experienceRangeStart", value);
                  }}
                  value={positionValues?.experienceRangeStart}
                />
              </div>
              <div className="hidden-sm-down">
                <FormikReactSelect
                  name="position.experienceRangeEnd"
                  label="Exp: To"
                  isClearable={true}
                  placeholder="To"
                  options={dropdowns.yoeFrom}
                  onChange={(value) => {
                    setFieldValue("position.experienceRangeEnd", value, true);
                    handleChange("experienceRangeEnd", value);
                  }}
                  value={positionValues?.experienceRangeEnd}
                />
              </div>
              <div className="col-xl-3 px-0">
                <FormikInput
                  name="position.dateValues"
                  label="Select Date Range"
                  placeholder="Select Date"
                  variant="date"
                  range
                  showCloseBtn
                  onChange={(value) =>
                    handleChange("dateValues", [
                      value[0] ? startOfDay(new Date(value[0])) : null,
                      value[1] ? startOfDay(new Date(value[1])) : null,
                    ])
                  }
                  value={positionValues?.dateValues}
                  onClear={() => handleChange("dateValues", [])}
                />
              </div>
              <div className="col-xl-2 px-0 hidden-sm-down">
                <FormikInput
                  name="position.utilization"
                  label="Availability"
                  placeholder="Enter %"
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  onKeyDown={blockInvalidNumberInput}
                  onChange={(value) => {
                    setFieldValue("position.utilization", value || "", true);
                    handleChange("utilization", value || "");
                  }}
                  value={positionValues?.utilization}
                />
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ResultFilter;
