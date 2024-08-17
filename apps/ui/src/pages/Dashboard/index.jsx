import { Heading, ReactSelect, Spinner, Text } from "@allocate-core/ui-components";
import {
  formatExperienceCountDataset,
  formatSkillDataset,
} from "@allocate-core/util-formatting";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import { getDashboardData } from "../../api/dashboard";
import { isMobile } from "../../common/common";
import Wrapper from "../../components/Layout/Wrapper";
import chartColors from "../../constants/chartColors";
import countGraph from "../../constants/countGraph";
import skillGraph from "../../constants/skillGraph";
import { useDashboardStore } from "../../store/dashboardStore";
import { quickSearchDropdowns } from "../QuickSearch/quickSearchDropdowns";
import BarGraph from "./components/BarGraph";
import ChartSelection, { formatSelectedValue } from "./components/ChartSelection";
import CountCard from "./components/CountCard";
import DoughnutChart from "./components/DoughnutChart";
import styles from "./dashboard.module.css";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useDashboardStore(
    (state) => [state.employeeData, state.setEmployeeData],
    shallow,
  );
  const [cafeSkillData, setCafeSkillData] = useDashboardStore(
    (state) => [state.cafeSkillData, state.setCafeSkillData],
    shallow,
  );
  const [openPositionData, setOpenPositionData] = useDashboardStore(
    (state) => [state.openPositionData, state.setOpenPositionData],
    shallow,
  );
  const setSortAscOrder = useDashboardStore((state) => state.setSortAscOrder);
  const cafeSkillSortValue = useDashboardStore(
    (state) => state.sortAscOrder.dashboardCafeSkills,
    shallow,
  );
  const openPositionSortValue = useDashboardStore(
    (state) => state.sortAscOrder.openPositions,
    shallow,
  );
  const [chartOptionSelected, setChartOptionSelected] = useState({
    project: undefined,
    role: undefined,
  });
  const [dropdowns, setDropdowns] = useState({ projects: [], roles: [] });
  const [choices, setChoices] = useState([
    {
      value: "Project",
      label: (
        <div className={styles.chartSelect}>
          <ReactSelect
            placeholder={"Project"}
            value={chartOptionSelected?.project}
            options={dropdowns.projects}
            onChange={(option) => {
              setChartOptionSelected({
                project: option,
                role: undefined,
              });
            }}
          />
        </div>
      ),
    },
    {
      value: "Role",
      label: "Role",
    },
  ]);
  const [choiceValue, setChoiceValue] = useState(
    choices.find((option) => option.value === "Project"),
  );

  const fetchDropdowns = () => {
    quickSearchDropdowns()
      .then((dropdown) => {
        setDropdowns({
          projects: dropdown.projects,
          roles: dropdown.roles,
        });
        setChartOptionSelected({
          project: formatSelectedValue(dropdown.projects?.[0], true),
          role: formatSelectedValue(dropdown.roles?.[0]),
        });
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  };

  const fetchData = () => {
    setIsLoading(true);
    if (!dropdowns.projects.length && !dropdowns.projects.length) {
      fetchDropdowns();
    }
    getDashboardData({
      skills_sort_ascending: cafeSkillSortValue,
      open_positions_sort_ascending: openPositionSortValue,
      project_id:
        choiceValue.value === "Project" ? chartOptionSelected?.project?.value : null,
      role_id: choiceValue.value !== "Project" ? chartOptionSelected?.role?.value : null,
    })
      .then((response) => {
        setEmployeeData(response?.employeeData);
        setCafeSkillData(
          formatSkillDataset(response?.cafeEmployeeSkills?.employeeSkillCount),
        );
        setOpenPositionData(
          formatExperienceCountDataset(response?.openPositions, "positions"),
        );
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [cafeSkillSortValue, openPositionSortValue, chartOptionSelected, choiceValue]);

  if (isLoading) return <Spinner />;

  return (
    <Wrapper elementId="top">
      <div className="row" id="top">
        <div className="col">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Employee Details
          </Heading>
        </div>
        <div className="ml-auto">
          <Text size={isMobile ? "b4" : "b3"} fontWeight="regular">
            % change from previous month
          </Text>
        </div>
      </div>
      <div className={`pt-20 ${isMobile ? "flex gap-10" : "row"}`}>
        <div className={isMobile ? "col px-0" : "col-xl-3"}>
          <CountCard
            title="Total Strength"
            count={employeeData?.totalPeopleCount}
            percentageChange={Math.round(employeeData?.changesInTotalPeople)}
            size={isMobile ? "h5" : "h3"}
          />
        </div>
        <div className={isMobile ? "col px-0" : "col-xl-3"}>
          <CountCard
            title="Employees"
            count={employeeData?.employeesCount}
            percentageChange={Math.round(employeeData?.changesInEmployeesCount)}
            size={isMobile ? "h5" : "h3"}
          />
        </div>
        <div className={isMobile ? "col px-0" : "col-xl-3"}>
          <CountCard
            title="Contractors"
            count={employeeData?.contractorCount}
            percentageChange={Math.round(employeeData?.changesInContractorCount)}
            size={isMobile ? "h5" : "h3"}
          />
        </div>
        <div className={isMobile ? "col px-0" : "col-xl-3"}>
          <CountCard
            title="Interns"
            count={employeeData?.internCount}
            percentageChange={Math.round(employeeData?.changesInInternCount)}
            size={isMobile ? "h5" : "h3"}
          />
        </div>
      </div>
      <div className={isMobile ? "" : "row pt-20 mt-16"}>
        <div className={isMobile ? styles.subSectionTitle : "col-xl-4"}>
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Overall Gender Split
          </Heading>
          <div className="pt-20">
            <DoughnutChart
              labels={["Male", "Female"]}
              data={[employeeData?.maleCount, employeeData?.femaleCount]}
              doughnutColors={chartColors.genderSplit}
            />
          </div>
        </div>
        <div className={isMobile ? styles.subSectionTitle : "col-xl-4"}>
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Project Allocation
          </Heading>
          <div className="pt-20">
            <DoughnutChart
              labels={["Support", "Delivery"]}
              data={[employeeData?.supportPeople, employeeData?.deliveryPeople]}
              doughnutColors={chartColors.projectAllocation}
            />
          </div>
        </div>
        <div className={isMobile ? styles.subSectionTitle : "col-xl-4"}>
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Billing Strength
          </Heading>
          <div className={`${isMobile ? "flex gap-10" : "flex-col gap-20"} pt-20`}>
            <div className={isMobile ? "col px-0" : undefined}>
              <CountCard
                title="Billing Strength"
                count={employeeData?.allocatedPeople}
                percentageChange={Math.round(employeeData?.changesInAllocatedPeople)}
                size="h5"
                resize
              />
            </div>
            <div className={isMobile ? "col px-0" : undefined}>
              <CountCard
                title="Cafe Strength"
                count={employeeData?.cafePeople}
                percentageChange={Math.round(employeeData?.changesInCafePeople)}
                size="h5"
                resize
              />
            </div>
            <div className={isMobile ? "col px-0" : undefined}>
              <CountCard
                title="Potential Cafe"
                count={employeeData?.potentialCafePeople}
                percentageChange={Math.round(employeeData?.changesInPotentialCafePeople)}
                size="h5"
                resize
              />
            </div>
          </div>
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Cafe - Skills & Proficiency
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={cafeSkillData?.labels}
            dataValues={cafeSkillData?.dataValues}
            graphConfig={skillGraph}
            isAscendingOrder={cafeSkillSortValue}
            updateSortOrder={(value) => setSortAscOrder({ dashboardCafeSkills: value })}
            showSorting
            showLegend
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div
          className={`col-xl-12 ${
            isMobile ? "flex-col" : "flex align-center justify-between"
          }`}
        >
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Open Positions
          </Heading>
          <ChartSelection
            dropdowns={dropdowns}
            selectedValue={chartOptionSelected}
            setSelectedValue={setChartOptionSelected}
            choices={choices}
            setChoices={setChoices}
            choiceValue={choiceValue}
            setChoiceValue={setChoiceValue}
          />
        </div>

        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={openPositionData?.labels}
            dataValues={openPositionData?.dataValues}
            graphConfig={countGraph}
            isAscendingOrder={openPositionSortValue}
            updateSortOrder={(value) => setSortAscOrder({ openPositions: value })}
            projectTooltip={
              choiceValue.value === "Project"
                ? chartOptionSelected?.project?.label?.props?.children[1]?.props?.children
                : null
            }
            roleTooltip={
              choiceValue.value !== "Project"
                ? chartOptionSelected?.role?.label?.props?.children[1]?.props?.children
                : null
            }
            showSorting
            showLegend
            showExperienceGraph
            showTitle
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default Dashboard;
