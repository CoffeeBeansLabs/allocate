import {
  Button,
  FormikInput,
  FormikReactSelect,
  RadioButton,
  Spinner,
  Text,
  UploadImages,
} from "@allocate-core/ui-components";
import {
  convertImageToURL,
  formatDropdownList,
  formatList,
  getIntegerOptions,
  getRamOptions,
} from "@allocate-core/util-data-values";
import { formatISO } from "date-fns";
import { Form, Formik } from "formik";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

import {
  createAsset,
  editAsset,
  getAssetBrands,
  getAssetModels,
  getAssetStatus,
  getAssetTypes,
} from "../../../api/asset";
import { getAllClients } from "../../../api/client";
import { getProjects } from "../../../api/projects";
import { getTalents } from "../../../api/talent";
import { getIntegerValueFromString, isMobile } from "../../../common/common";
import CreateNewDropdownValue from "../../../components/CreateNewDropdownValue";
import {
  jumpcloudOptions,
  leaseOptions,
  statusOptions,
} from "../../../constants/assetDropdowns";

const assetFormFields = {
  srNo: "",
  type: "",
  model: "",
  brand: "",
  colour: "",
  yearOfMfg: "",
  screenSize: "",
  ram: "",
  srNoScreenshot: [],
  comments: "",
  otherAssets: "",
  status: "",
  subStatus: "",
  ownershipType: "",
  leasingCompany: "",
  leaseStartDate: "",
  client: "",
  dateOfAllocation: "",
  invoiceNo: "",
  invoiceLink: "",
  purchaseDate: "",
  amount: "",
  gst: "",
  totalAmount: "",
  vendor: "",
  assignedTo: "",
  assignmentDate: "",
  warrantyPeriod: "",
  jumpcloudIntegration: "",
  project: "",
  location: "",
  cbAssetId: "",
};

const validationSchema = Yup.object().shape({
  cbAssetId: Yup.string().required("Enter CB asset number"),
  srNo: Yup.string().required("Enter serial number"),
  type: Yup.object().nullable(),
  model: Yup.object().nullable(),
  brand: Yup.object().required("Enter brand"),
  colour: Yup.string().nullable(),
  yearOfMfg: Yup.object().nullable(),
  screenSize: Yup.number()
    .typeError("Must be a number")
    .transform((originalValue, originalObject) => {
      const decimalValue = parseFloat(originalValue);
      if (isNaN(decimalValue)) {
        throw new Yup.ValidationError(
          "Invalid decimal",
          originalValue,
          originalObject.path,
        );
      }
      return decimalValue;
    })
    .min(0, "Must be greater than or equal to 0")
    .required("Enter screen size"),
  ram: Yup.object().nullable(),
  srNoScreenshot: Yup.array().of(Yup.string()).nullable(),
  comments: Yup.string().max(250, "Maximum 250 characters").nullable(),
  status: Yup.object().required("Select a status"),
  subStatus: Yup.object().required("Select a sub status"),
  ownershipType: Yup.object().required("Enter ownership"),
  leasingCompany: Yup.object().nullable(),
  leaseStartDate: Yup.string().nullable(),
  client: Yup.object().nullable(),
  dateOfAllocation: Yup.string().nullable(),
  invoiceNo: Yup.string().nullable(),
  invoiceLink: Yup.string().url().nullable(),
  purchaseDate: Yup.string().nullable(),
  amount: Yup.number().nullable(),
  gst: Yup.number().nullable(),
  totalAmount: Yup.number().nullable(),
  vendor: Yup.string().nullable(),
  assignedTo: Yup.object().nullable(),
  assignmentDate: Yup.string().nullable(),
  warrantyPeriod: Yup.number().nullable(),
  jumpcloudIntegration: Yup.object().nullable(),
  project: Yup.object().nullable(),
  location: Yup.string().required(),
});

const dropdownsWithNavigationAction = {
  type: (prev, response) => ({
    ...prev,
    types: formatList(response),
  }),
  model: (prev, response) => ({
    ...prev,
    models: formatList(response),
  }),
  brand: (prev, response) => ({
    ...prev,
    brands: formatList(response),
  }),
};

const getDropdownSpecificApis = {
  type: () => getAssetTypes(),
  model: () => getAssetModels(),
  brand: () => getAssetBrands(),
};

const AssetsForm = ({
  type = "add",
  onCancel = () => {},
  onSubmit = () => {},
  setFormDirty = () => {},
  assetData = {},
  archiveAssets = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [dropdowns, setDropdowns] = useState({
    brands: [],
    models: [],
    types: [],
    yearOfMfg: getIntegerOptions(1950, new Date().getFullYear(), 1),
    ram: getRamOptions(2, 32, 2),
    activeSubStatus: [],
    closedSubStatus: [],
    clients: [],
    employees: [],
    projects: [],
  });
  const [isFocused, setIsFocused] = useState({
    types: false,
    models: false,
    brands: false,
  });
  const [refetchDropdown, setRefetchDropdown] = useState({
    types: false,
    models: false,
    brands: false,
  });
  const [searchState, setSearchState] = useState({
    assignedTo: "",
    project: "",
    client: "",
  });
  const [dropdownLoadingState, setDropdownLoadingState] = useState({
    employees: false,
    clients: false,
    projects: false,
  });

  const isEditForm = type === "edit";
  const assetDataTimeLineLatest = assetData?.timeline?.[assetData?.timeline?.length - 1];

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getAssetStatus(), getAssetModels(), getAssetBrands(), getAssetTypes()])
      .then((response) => {
        setDropdowns((prev) => ({
          ...prev,
          activeSubStatus: formatDropdownList(response[0]?.active),
          closedSubStatus: formatDropdownList(response[0]?.close),
          models: formatList(response[1]),
          brands: formatList(response[2]),
          types: formatList(response[3]),
        }));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (refetchDropdown.types) refetchDropdownData("type");
    if (refetchDropdown.models) refetchDropdownData("model");
    if (refetchDropdown.brands) refetchDropdownData("brand");
  }, [refetchDropdown]);

  const handleSubmit = (values) => {
    setFormDirty(true);

    const assetPayload = {
      model: values.model?.value,
      type: values.type?.value,
      brand: values.brand?.value,
      cbAssetId: values.cbAssetId,
      ownership: values.ownershipType.value,
      screensize: values.screenSize,
      colour: values.colour || null,
      year: values.yearOfMfg?.value,
      ram: getIntegerValueFromString(values.ram.label),
      dateOfPurchase: values.purchaseDate
        ? formatISO(new Date(values.purchaseDate), {
            format: "extended",
            representation: "complete",
          })
        : null,
      invoiceNum: values.invoiceNo || null,
      linkToInvoice: values.invoiceLink || null,
      amount: values.amount || null,
      gst: values.gst || null,
      totalAmtPaid: values.totalAmount || null,
      vendor: values.vendor || null,
      assignedTo: values.userId || null,
      isJumpCloudIntegration: values.jumpcloudIntegration?.value === "yes" || null,
      warranty: values.warrantyPeriod || null,
      leaseStartDate: values.leaseStartDate
        ? formatISO(new Date(values.leaseStartDate), {
            format: "extended",
            representation: "complete",
          })
        : null,
      leasingCompany: values.leasingCompany?.value,
      clientAssetAllocationDate: values.dateOfAllocation
        ? formatISO(new Date(values.dateOfAllocation), {
            format: "extended",
            representation: "complete",
          })
        : null,
      comments: values.comments || null,
      archived: archiveAssets,
      screenshot: screenshots[0] || null,
    };

    const inUseAssetPayload = {
      userId: values.assignedTo?.value || null,
      dateOfChange: formatISO(new Date(), {
        format: "extended",
        representation: "complete",
      }),
      client: values.client?.label,
      location: values?.location,
      otherAssets: values?.otherAssets || null,
      comments: values.comments || null,
      project: values?.project?.label || null,
      active: values.status?.value === "active" ? values.subStatus?.value : null,
      closed: values.status?.value === "closed" ? values.subStatus?.value : null,
    };

    const payload = isEditForm
      ? {
          inventory: assetPayload,
          inUseAsset: inUseAssetPayload,
        }
      : {
          inventory: { serialNum: values?.srNo, ...assetPayload },
          inUseAsset: {
            serialNum: values?.srNo,
            ...inUseAssetPayload,
          },
        };

    Promise.all([isEditForm ? editAsset(values?.srNo, payload) : createAsset(payload)])
      .then(() => toast.success(isEditForm ? "Asset Edited" : "Asset Created"))
      .catch((errResponse) => toast.error(errResponse))
      .finally(() => onSubmit());
  };

  const refetchDropdownData = (key) => {
    setIsLoading(true);
    Promise.all([getDropdownSpecificApis[key]()])
      .then((response) => {
        setDropdowns((prev) => dropdownsWithNavigationAction[key](prev, response[0]));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
        setRefetchDropdown({ models: false, types: false, brands: false });
      });
  };

  const assetEditFormFields = {
    srNo: assetData?.serialNum || "",
    cbAssetId: assetData?.cbAssetId,
    type: assetData?.type ? { value: assetData?.type, label: assetData?.type } : "",
    model: assetData?.model ? { value: assetData?.model, label: assetData?.model } : "",
    brand: assetData?.brand
      ? {
          value: assetData?.brand,
          label: assetData?.brand,
        }
      : "",
    colour: assetData?.colour || "",
    yearOfMfg: { value: Number(assetData?.year), label: assetData?.year } || "",
    screenSize: assetData?.screensize ? Number(assetData.screensize) : 0,
    ram: assetData?.ram
      ? { value: `${assetData?.ram}GB`, label: `${assetData?.ram}GB` }
      : "",
    srNoScreenshot: assetData?.screenshot || [],
    comments: assetData?.comments || "",
    otherAssets: assetData?.otherAssets || "",
    status: assetDataTimeLineLatest?.active
      ? statusOptions[0]
      : assetDataTimeLineLatest?.closed
        ? statusOptions[1]
        : "",
    subStatus: assetDataTimeLineLatest?.active
      ? dropdowns?.activeSubStatus?.filter(
          (statusObj) => statusObj.value === assetDataTimeLineLatest?.active,
        )[0]
      : assetDataTimeLineLatest?.closed
        ? dropdowns?.closedSubStatus?.filter(
            (statusObj) => statusObj.value === assetDataTimeLineLatest?.closed,
          )[0]
        : "",
    ownershipType:
      leaseOptions?.filter((item) => item.label === assetData?.ownership)[0] || "",
    leasingCompany: assetData?.leasingCompany || "",
    leaseStartDate: assetData?.leaseStartDate ? new Date(assetData?.leaseStartDate) : "",
    client: assetData?.client
      ? { value: assetData?.client, label: assetData?.client }
      : "",
    dateOfAllocation: assetData?.clientAssetAllocationDate || "",
    invoiceNo: assetData?.invoiceNum || "",
    invoiceLink: assetData?.linkToInvoice || "",
    purchaseDate: assetData?.dateOfPurchase || "",
    amount: assetData?.amount || "",
    gst: assetData?.gst || "",
    totalAmount: assetData?.totalAmtPaid || "",
    vendor: assetData?.vendor || "",
    assignedTo: assetData?.taggedTo
      ? { value: assetData?.userId, label: assetData?.taggedTo }
      : "",
    assignmentDate: assetData?.dateOfChange ? new Date(assetData?.dateOfChange) : "",
    warrantyPeriod: assetData?.warranty ? Number(assetData?.warranty) : "",
    jumpcloudIntegration: assetData?.isJumpCloudIntegration || "",
    location: assetData?.location || "",
    project: assetData?.project
      ? { value: assetData?.project, label: assetData?.project }
      : "",
  };

  const handleSearch = (searchValue, name) => {
    if (name in searchState) {
      setSearchState((prev) => ({ ...prev, [name]: searchValue }));
    }
  };

  const fetchData = useCallback((fetchFunction, formatFunction, key, searchQuery) => {
    fetchFunction({
      search: searchQuery || null,
    })
      .then((response) => {
        setDropdowns((prev) => ({
          ...prev,
          [key]: formatFunction(response),
        }));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setDropdownLoadingState((prev) => ({ ...prev, [key]: false }));
      });
  }, []);

  const fetchEmployees = useCallback(
    (searchQuery) => {
      fetchData(
        getTalents,
        (response) =>
          formatDropdownList(response?.users, { value: "id", label: "fullName" }),
        "employees",
        searchQuery,
      );
    },
    [fetchData],
  );

  const fetchClients = useCallback(
    (searchQuery) => {
      fetchData(
        getAllClients,
        (response) => formatDropdownList(response?.clients),
        "clients",
        searchQuery,
      );
    },
    [fetchData],
  );

  const fetchProjects = useCallback(
    (searchQuery) => {
      fetchData(
        getProjects,
        (response) => formatDropdownList(response?.projects),
        "projects",
        searchQuery,
      );
    },
    [fetchData],
  );

  //generic debounced function for employees, projects and clients
  const fetchDebounced = useCallback(
    debounce((searchValue, key) => {
      switch (key) {
        case "employees":
          fetchEmployees(searchValue);
          break;
        case "clients":
          fetchClients(searchValue);
          break;
        case "projects":
          fetchProjects(searchValue);
          break;
        default:
          break;
      }
    }, 500),
    [],
  );

  useEffect(() => {
    const getActiveSearchParameter = () => {
      if (searchState.assignedTo) {
        return { key: "employees", value: searchState.assignedTo };
      } else if (searchState.client) {
        return { key: "clients", value: searchState.client };
      } else if (searchState.project) {
        return { key: "projects", value: searchState.project };
      } else {
        return null;
      }
    };

    const activeSearchParameter = getActiveSearchParameter();

    if (!activeSearchParameter) {
      setDropdownLoadingState((prev) => ({
        ...prev,
        employees: false,
        clients: false,
        projects: false,
      }));
      setDropdowns((prev) => ({
        ...prev,
        employees: [],
        clients: [],
        projects: [],
      }));
      return;
    }

    setDropdownLoadingState((prev) => ({
      ...prev,
      [activeSearchParameter.key]: true,
    }));

    fetchDebounced(activeSearchParameter.value, activeSearchParameter.key);

    return () => {
      fetchDebounced.cancel();
    };
  }, [searchState]);

  if (isLoading) return <Spinner />;

  return (
    <Formik
      initialValues={
        type === "edit" ? { ...assetEditFormFields } : { ...assetFormFields }
      }
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, dirty, errors }) => {
        useEffect(() => {
          setFormDirty(dirty);
        }, [dirty]);

        useEffect(() => {
          updateValues(values.amount, values.gst);
        }, [values.amount, values.gst]);

        const [amount, setAmount] = useState(values.amount);
        const [gst, setGST] = useState(values.gst);
        const [totalAmount, setTotalAmount] = useState(values.totalAmount);

        const updateValues = (inputAmount, inputGST) => {
          const calculatedGST = (inputAmount * inputGST) / 100;
          const inputAmountValue = !inputAmount ? 0 : parseFloat(inputAmount);
          let totalAmountValue = inputAmountValue + calculatedGST;
          setAmount(inputAmount);
          setGST(inputGST);
          setTotalAmount(totalAmountValue.toFixed(2));
          setFieldValue("amount", inputAmount);
          setFieldValue("gst", inputGST);
          setFieldValue("totalAmount", totalAmountValue.toFixed(2));
        };

        const handleAmountChange = (e) => {
          const inputAmount = e.target.value;
          updateValues(inputAmount, gst);
        };

        const handleGSTChange = (e) => {
          const inputGST = e.target.value;
          updateValues(amount, inputGST);
        };

        useEffect(() => {
          if (values?.srNoScreenshot !== "" && dirty) {
            Promise.all(
              values?.srNoScreenshot?.map(async (item) => {
                const base64String = await convertImageToURL(item);
                return base64String;
              }),
            )
              .then((imageFiles) => {
                setScreenshots(imageFiles);
              })
              .catch((err) => {
                toast.error(err);
              });
          }
        }, [values?.srNoScreenshot]);

        return (
          <Form className="row">
            <div className="col-xl-6 mt-16">
              <FormikInput name="srNo" label="Sr. No. *" placeholder="Enter Sr No." />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="cbAssetId"
                label="CB Asset ID *"
                placeholder="Enter CB Asset ID"
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="type"
                label="Type"
                placeholder="Select Type"
                options={dropdowns.types}
                onMenuInputFocus={() =>
                  setIsFocused((prev) => ({ ...prev, types: true }))
                }
                onMenuInputBlur={() => {
                  setIsFocused((prev) => ({ ...prev, types: false }));
                  setRefetchDropdown((prev) => ({ ...prev, types: true }));
                }}
                components={{
                  MenuList: CreateNewDropdownValue,
                }}
                {...{
                  menuIsOpen: isFocused.types || undefined,
                }}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="model"
                label="Model"
                placeholder="Select Model"
                options={dropdowns.models}
                onMenuInputFocus={() =>
                  setIsFocused((prev) => ({ ...prev, models: true }))
                }
                onMenuInputBlur={() => {
                  setIsFocused((prev) => ({ ...prev, models: false }));
                  setRefetchDropdown((prev) => ({ ...prev, models: true }));
                }}
                components={{
                  MenuList: CreateNewDropdownValue,
                }}
                {...{
                  menuIsOpen: isFocused.models || undefined,
                }}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="brand"
                label="Brand *"
                placeholder="Select Brand"
                options={dropdowns.brands}
                onMenuInputFocus={() =>
                  setIsFocused((prev) => ({ ...prev, brands: true }))
                }
                onMenuInputBlur={() => {
                  setIsFocused((prev) => ({ ...prev, brands: false }));
                  setRefetchDropdown((prev) => ({ ...prev, brands: true }));
                }}
                components={{
                  MenuList: CreateNewDropdownValue,
                }}
                {...{
                  menuIsOpen: isFocused.brands || undefined,
                }}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput name="colour" label="Colour" placeholder="Enter Colour" />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="yearOfMfg"
                label="Year of Mfg"
                placeholder="Select Year"
                variant="date"
                options={dropdowns.yearOfMfg}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="screenSize"
                label="Screen Size (inch) *"
                placeholder="Select Screen Size"
                type="number"
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="ram"
                label="RAM"
                placeholder="Select Memory"
                options={dropdowns.ram}
              />
            </div>
            <div className="col-xl-12 mt-16">
              <UploadImages
                editImageURLs={assetData?.screenshot ? Array(assetData?.screenshot) : []}
                label="Screenshot (Sr. no.)"
                onChange={(images) => setFieldValue("srNoScreenshot", images)}
              />
            </div>
            <div className="col-xl-12 mt-16">
              <FormikInput
                name="comments"
                variant="textarea"
                label="Comments"
                placeholder="Enter comment"
              />
            </div>
            <div className="col-xl-6 mt-16">
              <RadioButton
                label="Status *"
                error={errors?.status}
                options={statusOptions}
                value={values.status}
                onChange={(option) => {
                  setFieldValue("status", option);
                  setFieldValue("subStatus", "");
                }}
              />
            </div>
            <div className="col-xl-12 mt-16">
              <FormikInput
                name="otherAssets"
                variant="textarea"
                label="Other Assets"
                placeholder="Enter Other Assets"
              />
            </div>
            <div className="col-xl-6 mt-16">
              {values.status ? (
                <FormikReactSelect
                  name="subStatus"
                  label="Sub Status *"
                  placeholder="Enter Sub-Status"
                  options={
                    values.status?.value === "active"
                      ? dropdowns?.activeSubStatus
                      : dropdowns?.closedSubStatus
                  }
                  onChange={(option) => setFieldValue("subStatus", option)}
                />
              ) : null}
            </div>
            <Text size="b2" fontWeight="semibold" className="col-xl-12 mt-16 pt-20">
              Ownership Details
            </Text>
            <div className="col-xl-12 mt-16">
              <FormikReactSelect
                name="ownershipType"
                label="Ownership Type *"
                placeholder="Select Ownership Type"
                options={leaseOptions}
                onChange={(option) => setFieldValue("ownershipType", option)}
              />
            </div>
            {values.ownershipType ? (
              values.ownershipType?.value === "Client" ? (
                <div className="col-xl-12 px-0 flex">
                  <div className="col-xl-6 mt-16">
                    <FormikReactSelect
                      name="client"
                      label="Client"
                      onInputChange={handleSearch}
                      inputValue={searchState.client}
                      isClearable
                      placeholder="Search client"
                      options={dropdowns?.clients}
                      isLoadingInput={dropdownLoadingState.clients}
                    />
                  </div>
                  <div className="col-xl-6 mt-16">
                    <FormikInput
                      name="dateOfAllocation"
                      label="Date of allocation"
                      placeholder="Select Date"
                      variant="date"
                      onChange={(value) => {
                        if (value) setFieldValue("dateOfAllocation", new Date(value));
                      }}
                      showCloseBtn
                      onClear={() => setFieldValue("dateOfAllocation", "")}
                    />
                  </div>
                </div>
              ) : (
                values.ownershipType.value === "Leased" && (
                  <div className="col-xl-12 px-0 flex">
                    <div className="col-xl-6 mt-16">
                      <FormikInput
                        name="leasingCompany"
                        label="Leasing Company"
                        placeholder="Select company"
                      />
                    </div>
                    <div className="col-xl-6 mt-16">
                      <FormikInput
                        name="leaseStartDate"
                        label="Lease Start Date"
                        placeholder="Select Date"
                        variant="date"
                        onChange={(value) => {
                          if (value) setFieldValue("leaseStartDate", new Date(value));
                        }}
                        showCloseBtn
                        onClear={() => setFieldValue("leaseStartDate", "")}
                      />
                    </div>
                  </div>
                )
              )
            ) : null}
            <Text size="b2" fontWeight="semibold" className="col-xl-12 mt-16 pt-20">
              Invoice Details
            </Text>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="invoiceNo"
                label="Invoice No."
                placeholder="Enter invoice no."
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="purchaseDate"
                label="Date of purchase"
                placeholder="Select Date"
                variant="date"
                onChange={(value) => {
                  if (value) setFieldValue("purchaseDate", new Date(value));
                }}
                showCloseBtn
                onClear={() => setFieldValue("purchaseDate", "")}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="amount"
                label="Amount"
                placeholder="Enter amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="gst"
                label="GST"
                placeholder="Enter gst"
                type="number"
                variant="percent"
                value={gst}
                onChange={handleGSTChange}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="totalAmount"
                label="Total Amount"
                placeholder="Enter total amount"
                type="number"
                value={totalAmount}
                readOnly
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput name="vendor" label="Vendor" placeholder="Enter vendor" />
            </div>
            <div className="col-xl-12 mt-16">
              <FormikInput
                name="invoiceLink"
                label="Invoice Link"
                placeholder="Enter invoice link"
              />
            </div>
            <Text size="b2" fontWeight="semibold" className="col-xl-12 mt-16 pt-20">
              Other Details
            </Text>
            <>
              <div className="col-xl-6 mt-16">
                <FormikReactSelect
                  name="assignedTo"
                  label="Assigned To"
                  value={values.assignedTo}
                  onInputChange={handleSearch}
                  inputValue={searchState.assignedTo}
                  isClearable
                  placeholder="Search employee"
                  options={dropdowns?.employees}
                  isLoadingInput={dropdownLoadingState.employees}
                />
              </div>
              <div className="col-xl-6 mt-16">
                <FormikInput
                  name="assignmentDate"
                  label="Date of assignment"
                  placeholder="Select Date"
                  variant="date"
                  onChange={(value) => {
                    if (value) setFieldValue("assignmentDate", new Date(value));
                  }}
                  showCloseBtn
                  onClear={() => setFieldValue("assignmentDate", "")}
                />
              </div>
            </>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="warrantyPeriod"
                label="Warranty Period"
                placeholder="Enter Warranty Period"
                type="number"
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikReactSelect
                name="project"
                label="Project"
                placeholder="Search Project"
                onInputChange={handleSearch}
                inputValue={searchState.project}
                isClearable
                options={dropdowns?.projects}
                isLoadingInput={dropdownLoadingState.projects}
              />
            </div>
            <div className="col-xl-6 mt-16">
              <FormikInput
                name="location"
                label="Location *"
                placeholder="Location"
                type="string"
              />
            </div>
            <div className="col-xl-12 mt-16">
              <RadioButton
                label="Jumpcloud Integration"
                options={jumpcloudOptions}
                value={
                  values.jumpcloudIntegration ? jumpcloudOptions[0] : jumpcloudOptions[1]
                }
                mandatoryField={false}
                onChange={(option) => setFieldValue("jumpcloudIntegration", option)}
              />
            </div>
            <div className="col-xl-12 mt-16 pt-16 flex gap-30">
              <Button
                variant="tertiary"
                className={isMobile ? "col-xl-6" : "ml-auto"}
                style={{ color: "var(--color-MaximumRed)" }}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className={isMobile ? "col-xl-6" : undefined}
              >
                Save
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AssetsForm;
