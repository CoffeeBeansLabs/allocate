import { Spinner } from "@allocate-core/ui-components";
import { formatDropdownList, getIntegerOptions } from "@allocate-core/util-data-values";
import { getLocalFormatDate } from "@allocate-core/util-formatting";
import { Formik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { getPositionDropdowns } from "../../../../api/dropdowns";
import { createRolePosition, updateRolePosition } from "../../../../api/projects";
import { FormContent } from "./FormContent";

const positionFormFields = {
  role: "",
  positions: [
    {
      id: null,
      skills: [],
      experienceRangeStart: "",
      experienceRangeEnd: "",
      startDate: "",
      endDate: "",
      utilization: "",
      saveIsEnabled: false,
      isBillable: "",
    },
  ],
};

const validationSchema = Yup.object().shape({
  role: Yup.object().required("Select a role"),
  positions: Yup.array().of(
    Yup.object().shape({
      skills: Yup.array().of(Yup.object()).min(1, "Select atleast 1 skill"),
      experienceRangeStart: Yup.object().required("Required"),
      experienceRangeEnd: Yup.object()
        .test("is-greater", "To is less than From", function (experienceRangeEnd) {
          const { experienceRangeStart } = this.parent;
          if (experienceRangeStart && experienceRangeEnd)
            return experienceRangeEnd?.value >= experienceRangeStart?.value;
          return true;
        })
        .required("Required"),
      startDate: Yup.date().required("Select start date"),
      endDate: Yup.date()
        .when(
          "startDate",
          (startDate, schema) =>
            startDate && schema.min(startDate, "End Date must be after Start Date"),
        )
        .nullable(),
      utilization: Yup.number()
        .required("Required")
        .min(5, "Minimum is  5")
        .max(100, "Maximum is 100"),
      isBillable: Yup.object(),
    }),
  ),
});

const RolesForm = ({
  type = "add",
  data = {},
  onCreateSubmit,
  projectStartDate,
  projectEndDate,
  setFormDirty = () => {},
}) => {
  const { id: projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    roles: [],
    skills: [],
    billingStatus: [
      { label: "Non Billable", value: 0 },
      { label: "Billable", value: 1 },
    ],
    yoeFrom: getIntegerOptions(0, 30, 1),
    yoeTo: getIntegerOptions(0, 30, 1),
  });
  const [refetchDropdown, setRefetchDropdown] = useState(true);
  const [initialValues, setInitialValues] = useState(positionFormFields);
  const fieldArrayHelpersRef = useRef(null);

  const mapSkills = useCallback((skills, skillsOption) => {
    return skills.map((skill) => skillsOption.find(({ value }) => value === skill.id));
  }, []);

  const mapPositions = useCallback(
    (positions, skillsOption) => {
      return positions.map((pos) => ({
        id: pos?.id,
        skills: mapSkills(pos?.skills, skillsOption),
        experienceRangeStart: {
          value: pos?.experienceRangeStart,
          label: pos?.experienceRangeStart,
        },
        experienceRangeEnd: {
          value: pos?.experienceRangeEnd,
          label: pos?.experienceRangeEnd,
        },
        startDate: new Date(pos?.startDate),
        endDate: pos?.endDate ? new Date(pos?.endDate) : null,
        utilization: pos?.utilization,
        isBillable: {
          label: pos?.isBillable ? "Billable" : "Non Billable",
          value: pos?.isBillable,
        },
      }));
    },
    [mapSkills],
  );

  const handleDropdownResponse = useCallback(
    (response) => {
      const rolesOption = formatDropdownList(response.dropdowns?.roles);
      const skillsOption = formatDropdownList(response.dropdowns?.skills);

      setDropdowns((currentDropdowns) => ({
        ...currentDropdowns,
        roles: rolesOption,
        skills: skillsOption,
      }));

      if (type === "edit") {
        const role = rolesOption?.find(({ label }) => label === data?.roleName);
        const positions = data?.positions?.length
          ? mapPositions(data.positions, skillsOption)
          : [...positionFormFields.positions];

        setInitialValues((currentValues) => ({
          ...currentValues,
          role,
          positions,
        }));
      }
    },
    [type, data.positions, data?.roleName, mapPositions],
  );

  const fetchDropdown = useCallback(() => {
    setIsLoading(true);

    getPositionDropdowns()
      .then(handleDropdownResponse)
      .catch((errorResponse) => {
        toast.error(errorResponse?.data?.detail);
      })
      .finally(() => {
        setIsLoading(false);
        setRefetchDropdown(false);
      });
  }, [handleDropdownResponse]);

  useEffect(() => {
    if (refetchDropdown) fetchDropdown();
  }, [fetchDropdown, refetchDropdown]);

  const createPayload = (position, isEdit) => ({
    skills: position?.skills?.map((item) => item.value),
    utilization: Number(position?.utilization),
    startDate: position?.startDate ? getLocalFormatDate(position.startDate) : null,
    endDate: position?.endDate ? getLocalFormatDate(position.endDate) : null,
    isBillable: Boolean(position?.isBillable?.value),
    ...(isEdit
      ? {}
      : {
          experienceRangeStart: position?.experienceRangeStart?.value,
          experienceRangeEnd: position?.experienceRangeEnd?.value,
        }),
  });

  const handleSuccess = (message, index, setFieldValue, id = null) => {
    toast.success(message, { autoClose: 1000 });
    setFieldValue(`positions.${index}.saveIsEnabled`, false);
    if (id) setFieldValue(`positions.${index}.id`, id);
  };

  const handleError = (response) => {
    toast.error(response?.data?.message, { autoClose: 3000 });
  };

  const handleSubmit = (position, values, index, setFieldValue) => {
    if (position.id && type === "edit") {
      const editPayload = createPayload(position, true);
      updateRolePosition(position.id, editPayload)
        .then(() => handleSuccess("Position updated", index, setFieldValue))
        .catch(handleError);
    } else if (values.role) {
      const payload = {
        project: Number(projectId),
        role: values.role?.value,
        positions:
          type !== "edit"
            ? values?.positions?.map((pos) => createPayload(pos))
            : [createPayload(position)],
      };

      createRolePosition(payload)
        .then((response) => {
          if (type !== "edit") {
            onCreateSubmit();
          } else {
            handleSuccess(
              "Position added",
              index,
              setFieldValue,
              response?.positions?.[0].id,
            );
          }
        })
        .catch(handleError);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...initialValues }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue, dirty, isValid }) => {
        return (
          <FormContent
            values={values}
            setFieldValue={setFieldValue}
            dirty={dirty}
            isValid={isValid}
            dropdowns={dropdowns}
            type={type}
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
            handleSubmit={handleSubmit}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            setRefetchDropdown={setRefetchDropdown}
            fieldArrayHelpersRef={fieldArrayHelpersRef}
            setFormDirty={setFormDirty}
          />
        );
      }}
    </Formik>
  );
};

export default RolesForm;

RolesForm.propTypes = {
  type: PropTypes.oneOf(["add", "edit"]),
  data: PropTypes.shape({
    roleName: PropTypes.string,
    positions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        skills: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
          }),
        ),
        experienceRangeStart: PropTypes.number,
        experienceRangeEnd: PropTypes.number,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        utilization: PropTypes.number,
        isBillable: PropTypes.bool,
      }),
    ),
  }),
  onCreateSubmit: PropTypes.func,
  projectStartDate: PropTypes.string,
  projectEndDate: PropTypes.string,
  setFormDirty: PropTypes.func,
};
