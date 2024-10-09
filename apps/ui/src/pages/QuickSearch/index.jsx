import {
  Button,
  Divider,
  FormikInput,
  FormikReactSelect,
  Heading,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { blockInvalidNumberInput } from "@allocate-core/util-data-values";
import { FieldArray, Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { shallow } from "zustand/shallow";

import BinIcon from "/icons/binIcon.svg";
import BinIconRed from "/icons/binIconRed.svg";
import FilterIcon from "/icons/filter.svg";
import MenuIcon from "/icons/menuIcon.svg";

import { isMobile } from "../../common/common";
import CountryCity from "../../components/CustomFormFields/CountryCity";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import MobileModal from "../../components/MobileModal/MobileModal";
import { useCommonStore } from "../../store/commonStore";
import { useSearchStore } from "../../store/searchStore";
import styles from "./quickSearch.module.css";
import { quickSearchDropdowns } from "./quickSearchDropdowns";

const quickSearchFields = {
  positions: [
    {
      role: null,
      skills: [],
      experienceRangeStart: null,
      experienceRangeEnd: null,
      dateValues: [],
      utilization: null,
    },
  ],
  projects: [],
  country: [],
  city: [[]],
};

const validationSchema = Yup.object().shape({
  positions: Yup.array()
    .of(
      Yup.object().shape({
        role: Yup.object().nullable(),
        skills: Yup.array().of(Yup.object()).min(1, "Select atleast 1 skill"),
        experienceRangeStart: Yup.object().nullable(),
        experienceRangeEnd: Yup.object()
          .test("is-greater", "To is less than From", function (experienceRangeEnd) {
            const { experienceRangeStart } = this.parent;
            if (experienceRangeStart && experienceRangeEnd)
              return experienceRangeEnd?.value >= experienceRangeStart?.value;
            return true;
          })
          .nullable(),

        dateValues: Yup.array().nullable(),
        utilization: Yup.number()
          .min(5, "Minimum is  5")
          .max(100, "Maximum is 100")
          .nullable(),
      }),
    )
    .required()
    .min(1, "Add atleast one entry"),
  projects: Yup.array(),
  country: Yup.array().nullable(),
  city: Yup.array().when("country", {
    is: (country) => country && country[0] !== null && country.length > 0,
    then: Yup.array().of(Yup.array().of(Yup.object()).min(1, "Select at least one city")),
    otherwise: Yup.array().optional(),
  }),
});

const QuickSearch = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdowns, setDropdowns] = useSearchStore(
    (state) => [state.dropdowns, state.setDropdowns],
    shallow,
  );
  const setInitialState = useSearchStore((state) => state.setInitialState, shallow);
  const [resetQuickSearchForm, setResetQuickSearchForm] = useCommonStore(
    (state) => [state.resetQuickSearchForm, state.setResetQuickSearchForm],
    shallow,
  );

  const fieldArrayHelpersRef = useRef(null);
  const formikRef = useRef();

  const navigate = useNavigate();
  localStorage.removeItem("quick-search");

  useEffect(() => {
    if (
      !dropdowns?.projects?.length &&
      !dropdowns?.roles?.length &&
      !dropdowns?.skills?.length
    ) {
      setIsLoading(true);
      quickSearchDropdowns()
        .then((dropdown) => {
          setDropdowns({
            projects: dropdown.projects,
            roles: dropdown.roles,
            skills: dropdown.skills,
          });
        })
        .catch((errResponse) => toast.error(errResponse?.data?.detail))
        .finally(() => setIsLoading(false));
    }
  }, [dropdowns]);

  useEffect(() => {
    if (resetQuickSearchForm) {
      formikRef?.current.resetForm();
      setResetQuickSearchForm(false);
    }
  }, [resetQuickSearchForm]);

  const handleSearch = (values) => {
    localStorage.setItem("quick-search", JSON.stringify(values));
    setInitialState();
    navigate("/quick-search/results");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <section className={`${styles.section}`}>
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex gap-30 justify-between">
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              Quick Search - Talent
            </Heading>
          </div>
          <img
            src={FilterIcon}
            alt="filter clients"
            role="presentation"
            onClick={() => setIsFilterOpen(true)}
          />
        </Header>
      </header>
      <header className={`row ${styles.header} hidden-sm-down`}>
        <Heading size="h4" fontWeight="bold" className="col-xl-12 hidden-sm-down">
          Quick Search - Talent
        </Heading>
      </header>
      <Formik
        enableReinitialize
        initialValues={{ ...quickSearchFields }}
        onSubmit={handleSearch}
        validationSchema={validationSchema}
        innerRef={formikRef}
      >
        {({ values, setFieldValue }) => {
          const onAddMore = () => {
            fieldArrayHelpersRef.current.push({
              role: "",
              skills: [],
              experienceRangeStart: "",
              experienceRangeEnd: "",
              startDate: "",
              endDate: "",
              utilization: "",
              country: [],
              city: [[]],
            });
            const updatedCity = [...values.city, []];
            setFieldValue("city", updatedCity);
          };
          return (
            <Form noValidate>
              <FieldArray name="positions">
                {({ form, ...fieldArrayHelpers }) => {
                  fieldArrayHelpersRef.current = fieldArrayHelpers;

                  const onRemove = (index) => {
                    form.setFieldValue(
                      "positions",
                      values.positions.filter((_, idx) => idx !== index),
                    );
                  };

                  return (
                    values.positions &&
                    values.positions.length > 0 &&
                    values.positions.map((singlePosition, index) => (
                      <div
                        className={`mt-16 flex align-items-end gap-10 ${styles.positionForm}`}
                        key={`${singlePosition.role}_${index}`}
                        style={{ flexWrap: "wrap" }}
                      >
                        <img
                          role="presentation"
                          src={BinIconRed}
                          alt="delete icon(bin)"
                          className={`hidden-md-up ml-auto ${styles.bin} ${
                            values.positions.length === 1 ? "hide" : "show"
                          }`}
                          onClick={() => {
                            onRemove(index);
                          }}
                        />
                        <div className="col-xl-3 px-0">
                          <FormikReactSelect
                            name={`positions.${index}.role`}
                            label="Role"
                            placeholder="Select Role"
                            options={dropdowns.roles}
                            menuPlacement="auto"
                          />
                        </div>
                        <div className="col-xl-2 px-0">
                          <FormikReactSelect
                            required
                            name={`positions.${index}.skills`}
                            label="Skillset *"
                            placeholder="Select skillset"
                            options={dropdowns.skills}
                            isClearable={false}
                            isMulti
                            menuPlacement="auto"
                          />
                        </div>
                        <div className="hidden-md-up col-sm-12 px-0 flex gap-10">
                          <div className="col-sm-2 px-0">
                            <FormikReactSelect
                              required
                              name={`positions.${index}.experienceRangeStart`}
                              label="Exp: From"
                              placeholder="From"
                              isClearable={true}
                              options={dropdowns.yoeFrom}
                              menuPlacement="auto"
                            />
                          </div>
                          <div className="col-sm-2 px-0">
                            <FormikReactSelect
                              required
                              name={`positions.${index}.experienceRangeEnd`}
                              label="Exp: To"
                              placeholder="To"
                              isClearable={true}
                              options={dropdowns.yoeFrom}
                              menuPlacement="auto"
                            />
                          </div>
                          <div className="col-sm-2 px-0">
                            <FormikInput
                              required
                              name={`positions.${index}.utilization`}
                              label="Availability"
                              placeholder="Enter %"
                              type="number"
                              min="5"
                              max="100"
                              step="5"
                              onKeyDown={blockInvalidNumberInput}
                            />
                          </div>
                        </div>
                        <div className="hidden-sm-down col-xl-3 px-0 flex gap-10">
                          <div className="col px-0">
                            <FormikReactSelect
                              required
                              name={`positions.${index}.experienceRangeStart`}
                              label="Exp: From"
                              placeholder="From"
                              isClearable={true}
                              options={dropdowns.yoeFrom}
                              menuPlacement="auto"
                            />
                          </div>
                          <div className="col px-0">
                            <FormikReactSelect
                              required
                              name={`positions.${index}.experienceRangeEnd`}
                              label="Exp: To"
                              placeholder="To"
                              isClearable={true}
                              options={dropdowns.yoeFrom}
                              menuPlacement="auto"
                            />
                          </div>
                        </div>
                        <div className="col-xl-3 px-0">
                          <FormikInput
                            required
                            name={`positions.${index}.dateValues`}
                            label="Select Date Range"
                            placeholder="Select Date"
                            variant="date"
                            range
                            showCloseBtn
                            onChange={(value) => {
                              setFieldValue(`positions.${index}.dateValues`, [
                                new Date(value[0]),
                                new Date(value[1]),
                              ]);
                            }}
                            onClear={() => {
                              setFieldValue(`positions.${index}.dateValues`, []);
                            }}
                          />
                        </div>
                        <div className="hidden-sm-down col-xl-1 px-0">
                          <FormikInput
                            required
                            name={`positions.${index}.utilization`}
                            label="Availability"
                            placeholder="Enter %"
                            type="number"
                            min="5"
                            max="100"
                            step="5"
                            onKeyDown={blockInvalidNumberInput}
                          />
                        </div>
                        <div
                          className="col-xl-4 px-5"
                          style={{ position: "relative", bottom: "18px" }}
                        >
                          <CountryCity
                            index={index}
                            cityValue={values.city}
                            countryValue={values.country}
                            setFieldValue={setFieldValue}
                            dirty={false}
                            isMulti={true}
                          />
                        </div>

                        <img
                          role="presentation"
                          src={BinIcon}
                          alt="delete icon(bin)"
                          className={`hidden-sm-down ${styles.bin} ${
                            values.positions.length === 1 ? "hide" : "show"
                          }`}
                          onClick={() => {
                            onRemove(index);
                          }}
                        />
                        {isMobile && <Divider />}
                      </div>
                    ))
                  );
                }}
              </FieldArray>
              <div className={`flex align-center gap-20 mt-16 ${styles.footer}`}>
                <div className="col-xl-4 px-0 hidden-sm-down">
                  <FormikReactSelect
                    name="projects"
                    label="Choose Project"
                    placeholder="Select Project"
                    options={dropdowns.projects}
                    isClearable={false}
                    isMulti
                    menuPlacement="auto"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={onAddMore}
                  className={isMobile ? "col-sm-6 px-0" : "ml-auto"}
                >
                  <Text size="b2" fontWeight="medium">
                    + Add More
                  </Text>
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className={isMobile && "col-sm-6 px-0"}
                >
                  Search
                </Button>
              </div>
              <MobileModal
                title="Select Project"
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                isFullScreen={false}
                showTitle
              >
                <div className="py-20">
                  <FormikReactSelect
                    name="projects"
                    placeholder="Select Project"
                    options={dropdowns.projects}
                    isClearable={false}
                    isMulti
                  />
                </div>
                <Button
                  variant="primary"
                  className="mt-16 col-sm-12"
                  onClick={() => {
                    setIsFilterOpen(false);
                  }}
                >
                  Apply Filter
                </Button>
              </MobileModal>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
};

export default QuickSearch;
