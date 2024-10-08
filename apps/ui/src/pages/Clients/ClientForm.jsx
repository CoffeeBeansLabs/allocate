import {
  Button,
  Divider,
  FormikInput,
  FormikReactSelect,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import { FieldArray, Form, Formik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { createClient, updateClient } from "../../api/client";
import { getDropdowns } from "../../api/dropdowns";
import { isMobile } from "../../common/common";
import CountryCity from "../../components/CustomFormFields/CountryCity";
import PermissionGate from "../../components/PermissionGate";
import { SCOPES } from "../../constants/roles";
import styles from "./clientForm.module.css";

const clientFormFields = {
  name: "",
  status: { value: "ACTIVE", label: "Active" },
  city: "",
  country: "",
  industry: "",
  startDate: "",
  accountManager: "",
  remarks: "",
  pocs: [
    {
      name: "",
      email: "",
      phoneNumber: "",
      designation: "",
    },
    {
      name: "",
      email: "",
      phoneNumber: "",
      designation: "",
    },
  ],
};

const phoneRegExp = /^[-+]?\d+$/u;

const validationSchema = Yup.object().shape({
  name: Yup.string().min(2).required("Client name is required"),
  status: Yup.object().required(),
  city: Yup.object().required("Select a City").nullable(),
  country: Yup.object().required("Select a Country").nullable(),
  industry: Yup.object().required("Select Industry type"),
  startDate: Yup.string().required("Select Start Date"),
  accountManager: Yup.object().nullable(),
  remarks: Yup.string().max(250, "Maximum 250 characters").nullable(),
  pocs: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().when(["email", "phoneNumber", "designation"], {
          is: (email, phoneNumber, designation) => email || phoneNumber || designation,
          then: Yup.string().required("Name is required when adding POC details"),
          otherwise: Yup.string(),
        }),
        email: Yup.string().email("Must be a valid email").nullable(),
        phoneNumber: Yup.string()
          .matches(phoneRegExp, "Phone number is not valid")
          .nullable(),
        designation: Yup.string().nullable(),
      }),
    )
    .nullable(),
});

const ClientForm = ({
  type,
  data,
  onAddSuccess,
  onEditSuccess,
  setFormDirty = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(clientFormFields);
  const [showFormSubSection, toggleFormSubSection] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    statusOptions: [],
    industryOptions: [],
    accountManagers: [],
  });

  const setValuesInFormEditMode = (statusOptions, industryOptions, accountManagers) => {
    setInitialValues((currentState) => ({
      ...currentState,
      name: data?.name,
      startDate: new Date(data?.startDate),
      city: { value: data.city, label: data.city },
      country: { value: data.country, label: data.country },
      status: statusOptions?.find(
        ({ value }) => value === (data ? data.status : "ACTIVE"),
      ),
      industry: industryOptions?.find(({ value }) => value === data?.industry?.id),
      accountManager: accountManagers?.find(
        ({ value }) => value === data?.accountManager?.id,
      ),
      pocs: data?.pocs?.length
        ? data?.pocs?.length !== 2
          ? [...data.pocs].concat([clientFormFields.pocs[0]])
          : [...data.pocs]
        : [...clientFormFields.pocs],
      remarks: data?.comment || "",
    }));
  };

  useEffect(() => {
    setIsLoading(true);
    getDropdowns()
      .then((response) => {
        const statusOptions = formatDropdownList(response.status);
        const industryOptions = formatDropdownList(response.industries);
        const accountManagers = formatDropdownList(response.accountManagers, {
          value: "id",
          label: "fullNameWithExpBand",
        });
        setDropdowns((curState) => ({
          ...curState,
          statusOptions,
          industryOptions,
          accountManagers,
        }));
        if (type === "edit") {
          setValuesInFormEditMode(statusOptions, industryOptions, accountManagers);
        }
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const CTATitle = type === "edit" ? "Save changes" : "Add client";

  const areProjectsClosed = data?.projects?.length
    ? data.projects.find(
        (project) =>
          project.status === "CLOSED" &&
          new Date(project.endDate).getTime() < new Date().getTime(),
      ) !== undefined
    : true;

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      city: values.city?.value,
      startDate: values.startDate
        ? new Date(values.startDate).toISOString().slice(0, 10)
        : null,
      status: values.status?.value,
      country: values.country?.value,
      industry: values.industry?.value,
      accountManager: values.accountManager?.value || null,
      pocs: values.pocs
        ?.filter((poc) => poc.name?.length > 0)
        .map((poc) => ({
          name: poc.name,
          email: poc.email || null,
          phoneNumber: poc.phoneNumber || null,
          designation: poc.designation || null,
        })),
      comment: values.remarks || null,
    };

    if (type === "edit") {
      updateClient(data.id, payload)
        .then(onEditSuccess)
        .catch((errResponse) => {
          toast.error(errResponse?.data.detail);
        });
    } else {
      createClient(payload)
        .then(onAddSuccess)
        .catch((errResponse) => {
          const [parsedErrorMessage] =
            errResponse?.data?.detail?.name || errResponse?.data?.name || [];
          toast.error(parsedErrorMessage);
        });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.clientsForm}>
      <Formik
        enableReinitialize
        onSubmit={handleSubmit}
        initialValues={{ ...initialValues }}
        validationSchema={validationSchema}
      >
        {({ values, setFieldValue, dirty }) => {
          useEffect(() => {
            setFormDirty(dirty);
          }, [dirty]);

          return (
            <Form noValidate>
              <FormikInput
                required
                name="name"
                label="Client Name *"
                placeholder="Enter here"
              />
              <div className="pt-20">
                <FormikReactSelect
                  required
                  name="industry"
                  label="Domain (Industry) *"
                  placeholder="Select the domain"
                  options={dropdowns.industryOptions}
                />
              </div>
              <CountryCity
                cityValue={values.city}
                countryValue={values.country}
                setFieldValue={setFieldValue}
                dirty={dirty}
                isMulti={false}
              />
              <PermissionGate
                scopes={[SCOPES.canSetClientDormant]}
                showPermittedElement
                permittedElement={(hasPermission) => {
                  return (
                    <div className="pt-20">
                      <FormikReactSelect
                        name="status"
                        label="Status *"
                        placeholder="Select Status"
                        options={dropdowns.statusOptions}
                        isDisabled={
                          type === "edit"
                            ? (!hasPermission && values.status?.value === "ACTIVE") ||
                              !areProjectsClosed
                            : true
                        }
                      />
                      <Text size="b3">
                        {!areProjectsClosed
                          ? "(All projects under client must be closed to set to dormant)"
                          : ""}
                      </Text>
                    </div>
                  );
                }}
              />

              <div className="pt-20">
                <FormikInput
                  name="startDate"
                  label="Start Date *"
                  placeholder="Select Date"
                  variant="date"
                  onChange={(value) => {
                    setFieldValue("startDate", new Date(value));
                  }}
                  showCloseBtn={true}
                  onClear={() => {
                    setFieldValue("startDate", "");
                  }}
                />
              </div>
              <div className="row pt-20 justify-between">
                <div className="col-xl-4 pl-0">
                  {type === "edit" ? null : (
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => {
                        toggleFormSubSection((value) => !value);
                      }}
                    >
                      Add more details
                    </Button>
                  )}
                </div>
                <div
                  className={`col-xl-12 px-0 ${styles.additionalDetails} ${
                    showFormSubSection || type === "edit" ? "show" : "hide"
                  }`}
                >
                  <FieldArray
                    name="pocs"
                    render={() =>
                      values.pocs &&
                      values.pocs.map((poc, index) => (
                        <React.Fragment key={index}>
                          {isMobile ? <Divider /> : null}
                          <div className={`col-xl-12 ${styles.formSubSectionCard}`}>
                            <div className="row no-gutters">
                              <Text size="b1" fontWeight="bold">
                                Point of contact {`${index + 1}`}
                              </Text>
                              <Text size="b1">&nbsp;(Optional)</Text>
                            </div>
                            <div className="pt-20">
                              <FormikInput
                                name={`pocs.${index}.name`}
                                label="Name"
                                placeholder="Enter name"
                              />
                            </div>
                            <div className="pt-20">
                              <FormikInput
                                name={`pocs.${index}.email`}
                                type="email"
                                label="Email"
                                placeholder="Ex: xyz@gmail.com"
                              />
                            </div>
                            <div className="pt-20">
                              <FormikInput
                                name={`pocs.${index}.phoneNumber`}
                                label="Phone Number"
                                placeholder="Enter phone number"
                              />
                            </div>
                            <div className="pt-20">
                              <FormikInput
                                name={`pocs.${index}.designation`}
                                label="Designation"
                                placeholder="Enter designation"
                              />
                            </div>
                          </div>
                        </React.Fragment>
                      ))
                    }
                  />
                  {isMobile ? <Divider /> : null}
                  <div className={`col-xl-12 ${styles.formSubSectionCard}`}>
                    <div className="row no-gutters">
                      <Text size="b1" fontWeight="bold">
                        Other details
                      </Text>
                    </div>
                    <div className="pt-16">
                      <FormikReactSelect
                        name="accountManager"
                        label="Account Manager (Optional)"
                        placeholder="Select account manager"
                        options={dropdowns.accountManagers}
                      />
                    </div>
                    <div className="pt-16">
                      <FormikInput
                        variant="textarea"
                        name="remarks"
                        label="Remarks"
                        placeholder="Enter any remarks"
                        maxLength="250"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 ml-auto pt-16">
                  <Button
                    type="submit"
                    variant="primary"
                    className={isMobile ? "col-sm-12" : "ml-auto"}
                  >
                    {CTATitle}
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

ClientForm.propTypes = {
  type: PropTypes.oneOf(["add", "edit"]),
  data: PropTypes.shape({
    status: PropTypes.string,
    industry: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    accountManager: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    projects: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default ClientForm;
