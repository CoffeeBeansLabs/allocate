import {
  Button,
  ConfirmationModal,
  FormikInput,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { MAX_UTILIZATION } from "@allocate-core/util-data-values";
import { Form, Formik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { createAllocation, createAllocationRequest } from "../../../api/projects";
import { isMobile } from "../../../common/common";
import { getPermission } from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";

const addToProjectInitialValues = {
  utilization: "",
  startDate: "",
  endDate: "",
  ktPeriod: 0,
};

const validationSchema = Yup.object().shape({
  utilization: Yup.number()
    .required("Please Enter Utilisation.")
    .min(5, "Minimum is 5")
    .max(100, "Maximum is 100"),
  startDate: Yup.date().required("Please select a start date."),
  endDate: Yup.date()
    .when(
      "startDate",
      (startDate, schema) =>
        startDate && schema.min(startDate, "End Date must be after Start Date"),
    )
    .nullable(),
  ktPeriod: Yup.number().nullable(),
});

const AddToProjectForm = ({
  onSubmit,
  user,
  criteria,
  params,
  setFormDirty = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const canRequestTalent = getPermission([SCOPES.canRequestTalent]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newUtilization, setNewUtilization] = useState(null);
  const [formValues, setFormValues] = useState(null);

  const handleSubmit = (values) => {
    const { allocation = [] } = user || {};
    console.log("criteria: ", criteria);
    console.log("allocation: ", allocation);
    const { projectName, role, utilization } = criteria;
    const positionId = parseInt(params.positionId);
    const valueAssignedToTalent = parseInt(values.utilization);

    const currentAllocations = allocation.filter(
      (item) => new Date().getTime() < new Date(item.endDate).getTime(),
    );
    console.log("currentAllocations: ", currentAllocations);

    const isTalentAllocatedToPosition = currentAllocations.some(
      (allocation) => allocation.positionId === positionId,
    );
    console.log("isTalentAllocatedToPosition: ", isTalentAllocatedToPosition);

    const isTalentAllocatedToSameRole = currentAllocations.some(
      (allocation) =>
        allocation.projectName === projectName && allocation.positionRole.name === role,
    );
    console.log("isTalentAllocatedToSameRole: ", isTalentAllocatedToSameRole);

    const currentUtilizationOfTalent = currentAllocations.reduce(
      (acc, currentValue) => acc + currentValue.utilization,
      0,
    );
    console.log("currentUtilizationOfTalent: ", currentUtilizationOfTalent);

    const totalUtilizationOfTalent = valueAssignedToTalent + currentUtilizationOfTalent;
    console.log("totalUtilizationOfTalent: ", totalUtilizationOfTalent);

    if (
      isTalentAllocatedToPosition ||
      isTalentAllocatedToSameRole ||
      valueAssignedToTalent > utilization
    ) {
      submitAllocation(values); //API handles the errors.
      return;
    }

    if (totalUtilizationOfTalent > utilization) {
      const utilizationPercentage = (totalUtilizationOfTalent / MAX_UTILIZATION) * 100;
      setNewUtilization(utilizationPercentage);
      setFormValues(values);
      setShowConfirmation(true);
      return;
    }

    submitAllocation(values);
  };

  const submitAllocation = (values) => {
    setIsLoading(true);
    const payload = {
      user: user?.id,
      position: params?.positionId,
      utilization: values.utilization,
      startDate: new Date(values.startDate).toISOString().slice(0, 10),
      endDate: values.endDate
        ? new Date(values.endDate).toISOString().slice(0, 10)
        : null,
      ktPeriod: values.ktPeriod,
    };

    const request = canRequestTalent ? createAllocationRequest : createAllocation;

    request(payload)
      .then(() => {
        toast.success(
          canRequestTalent
            ? "Talent requested to the Project!"
            : "Talent added to the Project!",
        );
        onSubmit();
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleDismiss = () => {
    setShowConfirmation(false);
    if (formValues) {
      submitAllocation(formValues);
    }
  };

  return (
    <div>
      {isLoading && <Spinner />}
      <Formik
        enableReinitialize
        onSubmit={handleSubmit}
        initialValues={addToProjectInitialValues}
        validationSchema={validationSchema}
      >
        {({ setFieldValue, dirty }) => {
          useEffect(() => {
            setFormDirty(dirty);
          }, [dirty]);

          return (
            <Form noValidate>
              <Text size="b1" fontWeight="semibold">
                Name:{" "}
                <Text size="b1" fontWeight="regular">
                  {user?.fullNameWithExpBand}
                </Text>
              </Text>
              <div className="pt-20">
                <FormikInput
                  required
                  name="startDate"
                  variant="date"
                  minDate={new Date(criteria?.startDate)}
                  maxDate={new Date(criteria?.endDate)}
                  placeholder="Allocation start date"
                  label="Start Date"
                  onChange={(value) =>
                    setFieldValue("startDate", value ? new Date(value) : "")
                  }
                  showCloseBtn
                  onClear={() => setFieldValue("startDate", "")}
                />
              </div>
              <div className="pt-20">
                <FormikInput
                  name="endDate"
                  variant="date"
                  minDate={new Date(criteria?.startDate)}
                  maxDate={new Date(criteria?.endDate)}
                  placeholder="Allocation end date"
                  label="Allocation till (Optional)"
                  onChange={(value) =>
                    setFieldValue("endDate", value ? new Date(value) : "")
                  }
                  showCloseBtn
                  onClear={() => setFieldValue("endDate", "")}
                />
              </div>
              <div className="pt-20">
                <FormikInput
                  required
                  name="utilization"
                  type="number"
                  label="Allocation"
                  placeholder="Allocation"
                />
              </div>
              <div className="pt-20">
                <FormikInput
                  name="ktPeriod"
                  type="number"
                  placeholder="KT Period"
                  label="KT period In days (Optional)"
                />
              </div>
              <div className="pt-20">
                <Button
                  variant="primary"
                  type="submit"
                  className={`ml-auto ${isMobile && "col-sm-12"}`}
                >
                  {canRequestTalent ? "Request Talent" : "Add Talent"}
                </Button>
              </div>
              {showConfirmation && (
                <ConfirmationModal
                  message={`Warning! The person’s total utilization will be ${newUtilization.toFixed()}% if you continue with this allocation.`}
                  onConfirm={handleDismiss}
                  onCancel={handleCancel}
                />
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

AddToProjectForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fullNameWithExpBand: PropTypes.string.isRequired,
    allocation: PropTypes.arrayOf(
      PropTypes.shape({
        positionId: PropTypes.number.isRequired,
        projectName: PropTypes.string.isRequired,
        positionRole: PropTypes.shape({
          name: PropTypes.string.isRequired,
        }).isRequired,
        utilization: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  criteria: PropTypes.shape({
    utilization: PropTypes.number.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    projectName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    positionId: PropTypes.string.isRequired,
  }).isRequired,
  setFormDirty: PropTypes.func,
};

export default AddToProjectForm;
