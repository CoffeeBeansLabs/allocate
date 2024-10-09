import {
  Button,
  Divider,
  FormikInput,
  FormikReactSelect,
  Text,
} from "@allocate-core/ui-components";
import { FieldArray, Form } from "formik";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

import BinIcon from "../../../../../public/icons/binIcon.svg";
import BinIconRed from "../../../../../public/icons/binIconRed.svg";
import { deleteRolePosition } from "../../../../api/projects";
import { isMobile } from "../../../../common/common";
import CreateNewDropdownValue from "../../../../components/CreateNewDropdownValue";
import PermissionGate from "../../../../components/PermissionGate";
import { SCOPES } from "../../../../constants/roles";
import styles from "./rolesForm.module.css";

export const FormContent = ({
  values,
  setFieldValue,
  dirty,
  isValid,
  dropdowns,
  type,
  projectStartDate,
  projectEndDate,
  handleSubmit,
  isFocused,
  setIsFocused,
  setRefetchDropdown,
  fieldArrayHelpersRef,
  setFormDirty,
}) => {
  useEffect(() => {
    setFormDirty(dirty);
  }, [dirty, setFormDirty]);

  const handleChange = (name, value, index) => {
    setFieldValue(name, value);

    if (name.endsWith("isBillable")) {
      setFieldValue(name, value ? { value: value.value, label: value.label } : "");
    }

    setFieldValue(`positions.${index}.saveIsEnabled`, true);
  };

  const onAddMore = () => {
    fieldArrayHelpersRef.current.push({
      id: null,
      skills: [],
      experienceRangeStart: "",
      experienceRangeEnd: "",
      startDate: "",
      endDate: "",
      utilization: "",
      isBillable: "",
      saveIsEnabled: true,
    });
  };

  const getPermittedElement = (hasPermission) => (
    <FormikReactSelect
      name="role"
      label="Role"
      placeholder="Select Role"
      options={dropdowns.roles}
      isDisabled={type === "edit" && values.role !== ""}
      onMenuInputFocus={() => setIsFocused(true)}
      onMenuInputBlur={() => {
        setIsFocused(false);
        setRefetchDropdown(true);
      }}
      components={
        hasPermission && {
          MenuList: CreateNewDropdownValue,
        }
      }
      {...{
        menuIsOpen: isFocused || undefined,
        isFocused,
      }}
    />
  );

  return (
    <Form noValidate>
      <div className="row">
        <div className="col-xl-4">
          <PermissionGate
            scopes={[SCOPES.canCreateRole]}
            showPermittedElement
            permittedElement={getPermittedElement}
          />
        </div>
      </div>
      {isMobile && <Divider />}
      <FieldArray name="positions">
        {({ form, ...fieldArrayHelpers }) => {
          fieldArrayHelpersRef.current = fieldArrayHelpers;
          const onRemove = (positionId, index) => {
            if (type !== "edit") {
              return removePositionByIndex(index);
            }

            if (!positionId) {
              return removePositionByIndex(index);
            }

            deleteRolePosition(positionId)
              .then(() => {
                toast.success("Position deleted!", { autoClose: 1000 });
                removePositionById(positionId);
              })
              .catch((response) => {
                toast.error(response?.data.detail, { autoClose: 3000 });
              });
          };

          const removePositionByIndex = (index) => {
            const newPositions = values.positions.filter((_, idx) => idx !== index);
            form.setFieldValue("positions", newPositions);
          };

          const removePositionById = (positionId) => {
            const newPositions = values.positions.filter(
              (position) => position?.id !== positionId,
            );
            form.setFieldValue("positions", newPositions);
          };

          const isDisabled = (index) =>
            type === "edit" && values.positions[index].id !== null;

          return (
            values.positions &&
            values.positions.length > 0 &&
            values.positions.map((singlePosition, index) => (
              <div className={styles.positionSection} key={singlePosition.id}>
                <div className="flex align-items-end gap-10">
                  <Text size="b1" fontWeight="semibold">
                    Position {index + 1}
                  </Text>
                  <Text size="b3" fontWeight="regular">
                    Enter the primary skill first
                  </Text>
                  {isMobile ? (
                    <img
                      role="presentation"
                      src={BinIconRed}
                      alt="delete icon(bin)"
                      className={`hidden-md-up ml-auto ${styles.bin}`}
                      onClick={() => {
                        onRemove(singlePosition?.id, index);
                      }}
                    />
                  ) : null}
                </div>
                <div
                  className={`mt-16 ${
                    isMobile ? "col" : "bg-CadetGrey-op-10 br-10"
                  }  ${styles.positionCard}`}
                >
                  <div
                    className={`gap-10 ${
                      type === "edit" ? "flex align-items-end" : "flex-center"
                    } ${isMobile ? "row" : ""}`}
                  >
                    <div className="col-xl-3 px-0">
                      <FormikReactSelect
                        required
                        name={`positions.${index}.skills`}
                        label="Skillset"
                        placeholder="Select skillset"
                        options={dropdowns.skills}
                        isClearable={false}
                        isMulti
                        onChange={(value) => {
                          handleChange(`positions.${index}.skills`, value, index);
                        }}
                      />
                    </div>

                    <div className="hidden-sm-down col-xl-1 px-0">
                      <FormikReactSelect
                        required
                        name={`positions.${index}.experienceRangeStart`}
                        label="Exp: From"
                        placeholder="From"
                        options={dropdowns.yoeFrom}
                        isDisabled={isDisabled(index)}
                      />
                    </div>
                    <div className="hidden-sm-down col-xl-1 px-0">
                      <FormikReactSelect
                        required
                        name={`positions.${index}.experienceRangeEnd`}
                        label="Exp: To"
                        placeholder="To"
                        options={dropdowns.yoeFrom}
                        isDisabled={isDisabled(index)}
                      />
                    </div>
                    <div className={`hidden-md-up flex gap-20 ${styles.expMobileFlex}`}>
                      <div className="col-sm-6 px-0">
                        <FormikReactSelect
                          required
                          name={`positions.${index}.experienceRangeStart`}
                          label="Exp: From"
                          placeholder="From"
                          options={dropdowns.yoeFrom}
                          isDisabled={isDisabled(index)}
                        />
                      </div>
                      <div className="col-sm-6 px-0">
                        <FormikReactSelect
                          required
                          name={`positions.${index}.experienceRangeEnd`}
                          label="Exp: To"
                          placeholder="To"
                          options={dropdowns.yoeFrom}
                          isDisabled={isDisabled(index)}
                        />
                      </div>
                    </div>
                    <div className="hidden-sm-down col-xl-2 px-0">
                      <FormikInput
                        required
                        name={`positions.${index}.startDate`}
                        label="From"
                        placeholder="Select Date"
                        variant="date"
                        minDate={projectStartDate}
                        maxDate={projectEndDate}
                        onChange={(value) => {
                          handleChange(
                            `positions.${index}.startDate`,
                            new Date(value),
                            index,
                          );
                        }}
                        showCloseBtn={true}
                        onClear={() => {
                          handleChange(`positions.${index}.startDate`, "", index);
                        }}
                      />
                    </div>
                    <div className="hidden-sm-down col-xl-2 px-0">
                      <FormikInput
                        name={`positions.${index}.endDate`}
                        label="To (Optional)"
                        placeholder="Select Date"
                        variant="date"
                        minDate={projectStartDate}
                        maxDate={projectEndDate}
                        onChange={(value) => {
                          handleChange(
                            `positions.${index}.endDate`,
                            new Date(value),
                            index,
                          );
                        }}
                        showCloseBtn={true}
                        onClear={() => {
                          handleChange(`positions.${index}.endDate`, null, index);
                        }}
                      />
                    </div>
                    <div className="hidden-md-up flex gap-20">
                      <div className="col-xl-2 px-0">
                        <FormikInput
                          required
                          name={`positions.${index}.startDate`}
                          label="From"
                          placeholder="Select Date"
                          variant="date"
                          minDate={projectStartDate}
                          maxDate={projectEndDate}
                          onChange={(value) => {
                            handleChange(
                              `positions.${index}.startDate`,
                              new Date(value),
                              index,
                            );
                          }}
                          showCloseBtn={true}
                          onClear={() => {
                            handleChange(`positions.${index}.startDate`, "", index);
                          }}
                        />
                      </div>
                      <div className="col-xl-2 px-0">
                        <FormikInput
                          name={`positions.${index}.endDate`}
                          label="To (Optional)"
                          placeholder="Select Date"
                          variant="date"
                          minDate={projectStartDate}
                          maxDate={projectEndDate}
                          onChange={(value) => {
                            handleChange(
                              `positions.${index}.endDate`,
                              new Date(value),
                              index,
                            );
                          }}
                          showCloseBtn={true}
                          onClear={() => {
                            handleChange(`positions.${index}.endDate`, null, index);
                          }}
                        />
                      </div>
                    </div>
                    <div className={isMobile ? "col-xl-12 px-0" : ""}>
                      <FormikInput
                        required
                        name={`positions.${index}.utilization`}
                        label="Utilization"
                        placeholder="Enter utilization"
                        onChange={(value) => {
                          handleChange(`positions.${index}.utilization`, value, index);
                        }}
                      />
                    </div>
                    <div className="col-xl-3 px-0 hidden-md-up">
                      <FormikReactSelect
                        required
                        name={`positions.${index}.isBillable`}
                        label="Billing Status"
                        placeholder="Select billing status"
                        options={dropdowns.billingStatus}
                        isClearable={false}
                        onChange={(value) => {
                          handleChange(`positions.${index}.isBillable`, value, index);
                        }}
                      />
                    </div>
                    <div className="flex-col flex-center gap-10">
                      {!isMobile ? (
                        <img
                          role="presentation"
                          src={BinIcon}
                          alt="delete icon(bin)"
                          className={styles.bin}
                          onClick={() => {
                            onRemove(singlePosition?.id, index);
                          }}
                        />
                      ) : null}
                      {type === "edit" ? (
                        <Button
                          key={singlePosition?.id}
                          type="submit"
                          variant="primary"
                          onClick={() => {
                            if (!form.errors?.positions?.[index])
                              handleSubmit(singlePosition, values, index, setFieldValue);
                          }}
                          disabled={!values.positions[index].saveIsEnabled}
                          className={isMobile ? "col-xl-12" : ""}
                        >
                          Save
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`gap-10 mt-16 ${
                      type === "edit" ? "flex align-items-end" : "flex-start"
                    } hidden-sm-down`}
                  >
                    <div className="col-xl-3 px-0">
                      <FormikReactSelect
                        required
                        name={`positions.${index}.isBillable`}
                        label="Billing Status"
                        placeholder="Select billing status"
                        options={dropdowns.billingStatus}
                        isClearable={false}
                        onChange={(value) => {
                          handleChange(`positions.${index}.isBillable`, value, index);
                        }}
                      />
                    </div>
                  </div>
                </div>
                {isMobile && <Divider />}
              </div>
            ))
          );
        }}
      </FieldArray>
      <div className="col-xl-3 pt-20 ml-auto flex-center gap-20">
        <Button
          variant="secondary"
          onClick={onAddMore}
          className={`${isMobile ? "col-sm-6" : "ml-auto"}`}
        >
          <Text size="b2" fontWeight="medium">
            + Add More
          </Text>
        </Button>
        {type === "edit" ? null : (
          <Button
            type="submit"
            className={`${isMobile ? "col-sm-6" : "ml-auto"}`}
            variant="primary"
            onClick={() => {
              if (isValid) handleSubmit({}, values);
            }}
          >
            Save
          </Button>
        )}
      </div>
    </Form>
  );
};

FormContent.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  dropdowns: PropTypes.object.isRequired,
  type: PropTypes.oneOf(["add", "edit"]).isRequired,
  projectStartDate: PropTypes.string,
  projectEndDate: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  isFocused: PropTypes.bool.isRequired,
  setIsFocused: PropTypes.func.isRequired,
  setRefetchDropdown: PropTypes.func.isRequired,
  fieldArrayHelpersRef: PropTypes.object.isRequired,
  setFormDirty: PropTypes.func.isRequired,
};
