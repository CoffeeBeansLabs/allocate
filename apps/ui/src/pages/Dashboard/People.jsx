import {
  Heading,
  ReactSelect,
  Spinner,
  Table,
  Text,
  Tooltip,
} from "@allocate-core/ui-components";
import {
  formatCountDataset,
  formatExperienceDataset,
  formatSkillDataset,
  getFormatedDate,
} from "@allocate-core/util-formatting";
import { addMonths, format, isBefore, startOfYear } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import WarningIcon from "/icons/warningIcon.svg";

import { getAnniversaries, getLWDEmployees, getPeopleData } from "../../api/dashboard";
import { getAnniversaryReport, getLocationReport, getLWDReport } from "../../api/report";
import { isMobile } from "../../common/common";
import Wrapper from "../../components/Layout/Wrapper";
import PermissionGate, { getPermission } from "../../components/PermissionGate";
import chartColors from "../../constants/chartColors";
import { numberIcons } from "../../constants/common/";
import locationOptions from "../../constants/locationOptions";
import { SCOPES } from "../../constants/roles";
import skillGraph from "../../constants/skillGraph";
import yoeGraph from "../../constants/yoeGraph";
import { useDashboardStore } from "../../store/dashboardStore";
import BarGraph from "./components/BarGraph";
import DoughnutChart from "./components/DoughnutChart";
import Report from "./components/Report";
import styles from "./dashboard.module.css";

const People = () => {
  const monthYearOptions = (numberOfMonths) =>
    [...Array(numberOfMonths).keys()].map((i) => ({
      value: format(addMonths(new Date(), i), "yyyy-MM-dd"),
      label: format(addMonths(new Date(), i), "MMMM yyyy"),
    }));
  const anniversaryMonthOptions = monthYearOptions(12);
  const lwdMonthOptions = monthYearOptions(4);

  const [anniversaryMonthValue, setAnniversaryMonthValue] = useState(
    anniversaryMonthOptions[0],
  );
  const [lwdMonthValue, setLwdMonthValue] = useState(lwdMonthOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [overallSkillData, setOverallSkillData] = useDashboardStore(
    (state) => [state.overallSkillData, state.setOverallSkillData],
    shallow,
  );
  const [overallExperienceData, setOverallExperienceData] = useDashboardStore(
    (state) => [state.overallExperienceData, state.setOverallExperienceData],
    shallow,
  );

  const [overallIndustryData, setOverallIndustryData] = useDashboardStore(
    (state) => [state.overallIndustryData, state.setOverallIndustryData],
    shallow,
  );
  const [peopleData, setPeopleData] = useDashboardStore(
    (state) => [state.peopleData, state.setPeopleData],
    shallow,
  );
  const setSortAscOrder = useDashboardStore((state) => state.setSortAscOrder);
  const overallSkillsSortValue = useDashboardStore(
    (state) => state.sortAscOrder.peopleOverallSkills,
    shallow,
  );
  const overallExperienceSortValue = useDashboardStore(
    (state) => state.sortAscOrder.peopleOverallExperience,
    shallow,
  );
  const overallIndustriesSortValue = useDashboardStore(
    (state) => state.sortAscOrder.peopleOverallIndustries,
    shallow,
  );
  const [employeeAnniversaries, setEmployeeAnniversaries] = useState([]);
  const [employeeLWDs, setEmployeeLWDs] = useState([]);
  const navigate = useNavigate();
  const canViewLWD = getPermission([SCOPES.canViewLWD]);

  const fetchData = () => {
    setIsLoading(true);
    getPeopleData({
      proficiency_sort_ascending: overallSkillsSortValue,
      experience_sort_ascending: overallExperienceSortValue,
      industries_sort_ascending: overallIndustriesSortValue,
    })
      .then((response) => {
        setOverallSkillData(
          formatSkillDataset(response?.overallEmployeeSkills?.employeeSkillCount),
        );
        setPeopleData(response?.employeeData);
        setOverallExperienceData(
          formatExperienceDataset(
            response?.overallEmployeeSkillsExperience?.employeeSkillExperience,
          ),
        );
        setOverallIndustryData(
          formatCountDataset(
            response?.industryExperienceEmployee,
            "industry",
            "employeeCount",
          ),
        );
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [overallSkillsSortValue, overallExperienceSortValue, overallIndustriesSortValue]);

  useEffect(() => {
    const anniversaryDate = new Date(anniversaryMonthValue?.value);
    getAnniversaries(anniversaryDate.getMonth() + 1, anniversaryDate.getFullYear())
      .then((response) => {
        const filteredAnniversaries = response?.employeeAnniversary
          ?.filter((emp) =>
            isBefore(new Date(emp?.dateOfJoining), startOfYear(new Date())),
          )
          .sort(
            (a, b) =>
              a.years - b.years || new Date(a.dateOfJoining) - new Date(b.dateOfJoining),
          );
        setEmployeeAnniversaries(filteredAnniversaries);
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  }, [anniversaryMonthValue]);

  useEffect(() => {
    const lwdDate = new Date(lwdMonthValue?.value);
    if (canViewLWD)
      getLWDEmployees(lwdDate.getMonth() + 1, lwdDate.getFullYear())
        .then((response) =>
          setEmployeeLWDs(
            response?.employeeLastWorkingDay.toSorted(
              (a, b) => new Date(a.lastWorkingDay) - new Date(b.lastWorkingDay),
            ),
          ),
        )
        .catch((errResponse) => toast.error(errResponse?.data?.detail));
  }, [lwdMonthValue]);

  const anniversaryColumns = [
    {
      header: "",
      accessorKey: "years",
      className: isMobile ? "col" : "col-xl-2",
      cell: (value) => {
        return numberIcons[value.getValue() - 1] ? (
          <img
            src={numberIcons[value.getValue() - 1]}
            alt={`${value.getValue()} numberIcon`}
            className={styles.numberIcon}
          />
        ) : (
          <Text size="b1" fontWeight="medium">
            {value.getValue()}
          </Text>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "fullName",
      className: isMobile ? "col" : "col-xl-5",
      cell: ({ getValue, row }) => {
        return (
          <div className="flex align-start gap-10">
            <Text size="b1" fontWeight="medium">
              {getValue()}
            </Text>
            {row.original.isLwdBefore && (
              <Tooltip
                direction="right"
                content={
                  <div className={styles.tooltipText}>
                    <Text size="b3" fontWeight="medium">
                      This employee has their LWD before their Work Anniversary.
                    </Text>
                  </div>
                }
              >
                <img
                  src={WarningIcon}
                  alt="warning: lwd before anniversary"
                  className={styles.warningIcon}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      header: "Joining Date",
      accessorKey: "dateOfJoining",
      className: isMobile ? "col" : "col-xl-5",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {getFormatedDate(value.getValue())}
        </Text>
      ),
    },
  ];

  const lwdColumns = [
    {
      header: "Name",
      accessorKey: "fullName",
      className: isMobile ? "col" : "col-xl-5",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue()}
        </Text>
      ),
    },
    {
      header: "Last Working Day",
      accessorKey: "lastWorkingDay",
      className: isMobile ? "col" : "col-xl-4",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {getFormatedDate(value.getValue())}
        </Text>
      ),
    },
    {
      header: "Role",
      accessorKey: "roleName",
      className: isMobile ? "col" : "col-xl-3",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue()}
        </Text>
      ),
    },
  ];

  const getLocationCount = (location) =>
    peopleData?.employeeLocationCount.find(
      (locationCount) => locationCount.location === location,
    )?.locationCount || 0;

  const locationCountData = locationOptions.map((location) =>
    getLocationCount(location.value),
  );

  const headerStyles = !isMobile
    ? {
        backgroundColor: "var(--color-White)",
        borderBottom: "1px solid var(--color-CadetGrey)",
        color: "var(--color-CetaceanBlue)",
      }
    : undefined;

  if (isLoading) return <Spinner />;

  return (
    <Wrapper elementId="top">
      <div className="row" id="top">
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Overall - Skills & Proficiency
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={overallSkillData?.labels}
            dataValues={overallSkillData?.dataValues}
            graphConfig={skillGraph}
            isAscendingOrder={overallSkillsSortValue}
            updateSortOrder={(value) => setSortAscOrder({ peopleOverallSkills: value })}
            showLegend
            showSorting
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Overall - Skills & Experience
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={overallExperienceData?.labels}
            dataValues={overallExperienceData?.dataValues}
            graphConfig={yoeGraph}
            isAscendingOrder={overallExperienceSortValue}
            updateSortOrder={(value) =>
              setSortAscOrder({ peopleOverallExperience: value })
            }
            showSorting
            showLegend
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Overall - Industries
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={overallIndustryData?.labels}
            dataValues={overallIndustryData?.dataValues}
            graphConfig={[{ label: null, color: "#9E5DB5" }]}
            isAscendingOrder={overallIndustriesSortValue}
            updateSortOrder={(value) =>
              setSortAscOrder({ peopleOverallIndustries: value })
            }
            showSorting
          />
        </div>
      </div>
      <div className={`${isMobile ? "" : "row"} ${styles.subSectionTitle}`}>
        <div className={isMobile ? "" : "col-xl-4"}>
          <div className="flex">
            <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
              Location Split
            </Heading>
            <div className="ml-auto">
              <Report dataFunction={getLocationReport} filename="location" showLocation />
            </div>
          </div>
          <div className={styles.locationChart}>
            <DoughnutChart
              labels={["BLR", "PNQ", "HYD"]}
              data={locationCountData}
              doughnutColors={chartColors.locationSplitColors}
            />
          </div>
        </div>
        <div className={isMobile ? styles.subSectionTitle : "col-xl-8"}>
          <div className={`flex align-start ${isMobile ? "flex-col gap-20" : undefined}`}>
            <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
              Anniversaries
            </Heading>
            <div className="col px-0 flex gap-10">
              <div className="col-xl-5 ml-auto px-0">
                <ReactSelect
                  placeholder="Anniversary Month"
                  options={anniversaryMonthOptions}
                  value={anniversaryMonthValue}
                  onChange={setAnniversaryMonthValue}
                />
              </div>
              <Report dataFunction={getAnniversaryReport} filename="Anniversary" />
            </div>
          </div>
          <div className="pt-20">
            <Table
              columns={anniversaryColumns}
              tableData={employeeAnniversaries}
              headerStyles={headerStyles}
              isMaxHeight={true}
              maxHeight={252}
              hidePagination
              disableRowClick
            />
          </div>
        </div>
      </div>

      <PermissionGate
        scopes={[SCOPES.canViewLWD]}
        permittedElement={() => (
          <div className={`row ${styles.subSectionTitle}`}>
            <div className="col-xl-12">
              <div
                className={`flex align-start ${isMobile ? "flex-col gap-20" : "gap-10"}`}
              >
                <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
                  Last Working Day
                </Heading>
                <div className="col px-0 flex gap-10">
                  <div className="col-xl-3 ml-auto px-0">
                    <ReactSelect
                      placeholder="LWD Month"
                      options={lwdMonthOptions}
                      value={lwdMonthValue}
                      onChange={setLwdMonthValue}
                    />
                  </div>
                  <Report
                    dataFunction={getLWDReport}
                    filename="LWD"
                    showDateRange
                    datesRequired
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-12 pt-20">
              <Table
                columns={lwdColumns}
                tableData={employeeLWDs}
                onRowClick={(e, rowData) => {
                  e.preventDefault();
                  navigate(`/people/details/${rowData.id}`);
                }}
                headerStyles={headerStyles}
                hidePagination
              />
            </div>
          </div>
        )}
      />
    </Wrapper>
  );
};

export default People;
