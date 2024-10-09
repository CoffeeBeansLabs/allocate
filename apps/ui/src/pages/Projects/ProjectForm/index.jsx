import {
  Button,
  FormikInput,
  FormikReactSelect,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import { Form, Formik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { getProjectDropdowns } from "../../../api/dropdowns";
import { createProject, updateProject } from "../../../api/projects";
import { isMobile } from "../../../common/common";
import CountryCity from "../../../components/CustomFormFields/CountryCity";
import CurrencySelect from "../../../components/CustomFormFields/CurrencySelect";
import projectStatus from "../../../constants/status";
import { accountManagerConstraint } from "../RowStatusSelect";
import styles from "./projectForm.module.css";

const projectStatusOptions = projectStatus.map((status) => ({
  value: status.type,
  label: status.uiString,
}));

const projectFormFields = {
  name: "",
  client: "",
  status: "",
  city: "",
  country: "",
  startDate: "",
  endDate: "",
  currency: "",
  deliveryMode: "",
  engagementType: "",
  pocs: {
    name: "",
    email: "",
    phoneNumber: "",
    designation: "",
  },
  accountManager: "",
  remarks: "",
};

const phoneRegEx = /^[-+]?\d+$/u;

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Enter a name")
    .max(100, "Ensure this field has no more than 100 characters."),
  client: Yup.object().required("Select client"),
  status: Yup.object().required("Select status"),
  city: Yup.object().required("Select city").nullable(),
  country: Yup.object().required("Select country").nullable(),
  startDate: Yup.string().required("Select startDate"),
  endDate: Yup.string().nullable(),
  currency: Yup.object(),
  deliveryMode: Yup.object(),
  engagementType: Yup.object(),
  remarks: Yup.string().max(250, "Maximum 250 characters").nullable(),
  pocs: Yup.object().shape({
    name: Yup.string()
      .when(["email", "phoneNumber", "designation"], {
        is: (email, phoneNumber, designation) => email || phoneNumber || designation,
        then: Yup.string().required("Name is required when adding POC details"),
        otherwise: Yup.string(),
      })
      .max(100, "Ensure this field has no more than 100 characters."),
    email: Yup.string().email("Must be a valid email").nullable(),
    phoneNumber: Yup.string()
      .min(7, "Must be atleast 7 digits")
      .max(15, "Cannot be more than 15 digits")
      .matches(phoneRegEx, "Contains invalid phone number")
      .nullable(),
    designation: Yup.string()
      .nullable()
      .max(20, "Ensure this field has no more than 20 characters."),
  }),
  accountManager: Yup.object(),
});

const ProjectForm = ({ type, data = {}, onSubmit, setFormDirty = () => {} }) => {
  const [initialValues, setInitialValues] = useState(projectFormFields);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormSubSection, setShowFormSubSection] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    status: projectStatusOptions.filter(
      (status) => !accountManagerConstraint(status?.value),
    ),
    clients: [],
    deliveryModes: [],
    engagementTypes: [],
    accountManager: [],
  });

  useEffect(() => {
    setIsLoading(true);
    getProjectDropdowns()
      .then(({ dropdowns }) => {
        const clientsOptions = formatDropdownList(dropdowns?.clients);
        const engagementTypesOptions = formatDropdownList(dropdowns?.engagements);
        const deliveryModesOptions = formatDropdownList(dropdowns?.deliveryModes);
        const accountManagerOptions = formatDropdownList(dropdowns?.accountManager, {
          value: "id",
          label: "fullNameWithExpBand",
        });

        setDropdowns((currentState) => ({
          ...currentState,
          clients: clientsOptions,
          engagementTypes: engagementTypesOptions,
          deliveryModes: deliveryModesOptions,
          accountManager: accountManagerOptions,
        }));

        if (type === "edit") {
          setInitialValues((currentState) => ({
            ...currentState,
            name: data?.name || "",
            startDate: data?.startDate ? new Date(data?.startDate) : null,
            endDate: data?.endDate ? new Date(data?.endDate) : null,
            city: { value: data?.city, label: data?.city },
            country: { value: data?.country, label: data?.country },
            currency: data?.currency
              ? { value: data?.currency, label: data?.currency }
              : undefined,
            status: projectStatusOptions?.find(({ value }) => value === data?.status),
            client: clientsOptions?.find(({ value }) => value === data?.client?.id),

            engagementType: engagementTypesOptions?.find(
              ({ label }) => label === data?.engagementType,
            ),
            deliveryMode: deliveryModesOptions?.find(
              ({ label }) => label === data?.deliveryMode,
            ),
            pocs: {
              name: data?.pocName || "",
              email: data?.pocEmail || "",
              phoneNumber: data?.pocPhoneNumber || "",
              designation: data?.pocDesignation || "",
            },
            accountManager: accountManagerOptions?.find(
              ({ label }) => label === data?.accountManager,
            ),
            remarks: data?.comment || "",
          }));
        }
      })
      .catch((errResponse) => toast.error(errResponse.data?.detail))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const submissionTitle = type === "edit" ? "Save changes" : "Add project";

  const handleSubmit = (values) => {
    const projectPayload = {
      name: values.name,
      client: values.client?.value,
      status: values.status?.value,
      city: values.city?.value,
      country: values.country?.value,
      startDate: values.startDate
        ? new Date(values.startDate).toISOString().slice(0, 10)
        : null,
      endDate: values.endDate
        ? new Date(values.endDate).toISOString().slice(0, 10)
        : null,
      currency: values.currency?.value,
      deliveryMode: values.deliveryMode?.value,
      engagementType: values.engagementType?.value,
      pocs:
        values.pocs.name?.length > 0
          ? [
              {
                name: values.pocs?.name,
                email: values.pocs?.email || null,
                phoneNumber: values.pocs?.phoneNumber || null,
                designation: values.pocs?.designation || null,
              },
            ]
          : [],
      accountManager: values.accountManager?.value || null,
      comment: values?.remarks || null,
    };

    if (type === "edit") {
      updateProject(data.id, projectPayload)
        .then(onSubmit)
        .catch((response) => {
          toast.error(response?.data.detail, {
            autoClose: 3000,
          });
        });
    } else {
      createProject(projectPayload)
        .then(onSubmit)
        .catch((response) => {
          const [parsedErrorMessage] =
            response?.data?.detail?.name || response?.data?.name || [];
          toast.error(parsedErrorMessage);
        });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
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
            <div className={``}>
              <FormikInput
                required
                name="name"
                label="Project Name *"
                placeholder="Enter here"
              />
              <div className={`${isMobile ? "mt-16" : "pt-20"}`}>
                <FormikReactSelect
                  required
                  name="client"
                  label="Client *"
                  placeholder="Select Client"
                  options={dropdowns.clients}
                />
              </div>
              <div className="pt-20">
                <FormikReactSelect
                  required
                  name="status"
                  label="Project Status *"
                  placeholder="Select Status"
                  options={dropdowns.status}
                  isDisabled={accountManagerConstraint(data?.status)}
                />
              </div>
              <CountryCity
                cityValue={values.city}
                countryValue={values.country}
                setFieldValue={setFieldValue}
                dirty={dirty}
              />
              <div className="pt-20">
                <FormikInput
                  required
                  name="startDate"
                  label="Start Date *"
                  placeholder="Select Date"
                  variant="date"
                  onChange={(value) => {
                    setFieldValue(`startDate`, new Date(value));
                  }}
                  showCloseBtn={true}
                  onClear={() => {
                    setFieldValue(`startDate`, "");
                  }}
                />
              </div>
              <div className="pt-20">
                <FormikInput
                  name="endDate"
                  label="End Date  (Optional)"
                  placeholder="Select Date"
                  variant="date"
                  onChange={(value) => {
                    setFieldValue("endDate", new Date(value));
                  }}
                  showCloseBtn={true}
                  onClear={() => {
                    setFieldValue("endDate", "");
                  }}
                />
              </div>
            </div>
            <div className="row pt-20 justify-between">
              <div className="col-xl-4 pl-0">
                {type === "edit" ? null : (
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setShowFormSubSection((value) => !value);
                    }}
                  >
                    Add more details
                  </Button>
                )}
              </div>
              {showFormSubSection || type === "edit" ? (
                <div className={`col-xl-12 ${styles.additionalDetails}`}>
                  <div className="pt-20">
                    <FormikReactSelect
                      name="engagementType"
                      label="Type Of Engagement (Optional)"
                      placeholder="Select Engagement type"
                      options={dropdowns.engagementTypes}
                    />
                  </div>
                  <CurrencySelect
                    currencyValue={values.currency}
                    setFieldValue={setFieldValue}
                    dirty={dirty}
                  />
                  <div className="pt-20">
                    <FormikReactSelect
                      name="deliveryMode"
                      label="Delivery Mode (Optional)"
                      placeholder="Select Delivery Mode"
                      options={dropdowns.deliveryModes}
                    />
                  </div>
                  <div className={`col-xl-12 ${styles.formSubSectionCard}`}>
                    <div className="row no-gutters">
                      <Text size="b1" fontWeight="bold">
                        Point of contact
                      </Text>
                      <Text size="b1">&nbsp;(Optional)</Text>
                    </div>
                    <div className=" pt-20">
                      <FormikInput
                        name="pocs.name"
                        label="Name"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className=" pt-20">
                      <FormikInput
                        name="pocs.email"
                        label="Email"
                        placeholder="Ex: xyz@gmail.com"
                      />
                    </div>
                    <div className=" pt-20">
                      <FormikInput
                        name="pocs.phoneNumber"
                        label="Phone Number"
                        placeholder="+91  Enter phone number"
                      />
                    </div>
                    <div className="pt-20">
                      <FormikInput
                        name="pocs.designation"
                        label="Designation"
                        placeholder="Enter designation"
                      />
                    </div>
                  </div>
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
                        options={dropdowns.accountManager}
                        onChange={(value) => setFieldValue("accountManager", value)}
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
              ) : null}
              <div className="col-xl-4 ml-auto pt-16">
                <Button
                  type="submit"
                  className={isMobile ? "col-sm-12" : "ml-auto"}
                  variant="primary"
                >
                  {submissionTitle}
                </Button>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

ProjectForm.propTypes = {
  type: PropTypes.oneOf(["add", "edit"]),
};

export default ProjectForm;
