import { Heading, ReactSelect, Spinner } from "@allocate-core/ui-components";
import {
  formatExperienceCountDataset,
  formatExperienceDataset,
  formatSkillDataset,
} from "@allocate-core/util-formatting";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import { getCurrentAllocationData } from "../../api/dashboard";
import { isMobile } from "../../common/common";
import Wrapper from "../../components/Layout/Wrapper";
import countGraph from "../../constants/countGraph";
import skillGraph from "../../constants/skillGraph";
import yoeGraph from "../../constants/yoeGraph";
import { quickSearchDropdowns } from "../../pages/QuickSearch/quickSearchDropdowns";
import { useDashboardStore } from "../../store/dashboardStore";
import BarGraph from "./components/BarGraph";
import ChartSelection, { formatSelectedValue } from "./components/ChartSelection";
import styles from "./dashboard.module.css";

const CurrentAllocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectAllocationData, setProjectAllocationData] = useDashboardStore(
    (state) => [state.projectAllocationData, state.setProjectAllocationData],
    shallow,
  );
  const [roleBreakupData, setRoleBreakupData] = useDashboardStore(
    (state) => [state.roleBreakupData, state.setRoleBreakupData],
    shallow,
  );
  const [overallSkillData, setOverallSkillData] = useDashboardStore(
    (state) => [state.overallSkillData, state.setOverallSkillData],
    shallow,
  );
  const setSortAscOrder = useDashboardStore((state) => state.setSortAscOrder);
  const projectAllocationSortValue = useDashboardStore(
    (state) => state.sortAscOrder.projectAllocation,
    shallow,
  );
  const roleBreakupSortValue = useDashboardStore(
    (state) => state.sortAscOrder.roleBreakup,
    shallow,
  );
  const overallSkillsSortValue = useDashboardStore(
    (state) => state.sortAscOrder.currentAllocOverallSkills,
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
    getCurrentAllocationData({
      project_allocation_sort_ascending: projectAllocationSortValue,
      role_breakup_sort_ascending: roleBreakupSortValue,
      overall_skills_sort_ascending: overallSkillsSortValue,
      project_id:
        choiceValue.value === "Project" ? chartOptionSelected?.project?.value : null,
      role_id: choiceValue.value !== "Project" ? chartOptionSelected?.role?.value : null,
    })
      .then((response) => {
        setProjectAllocationData(
          formatExperienceCountDataset(response?.projectAllocation, "allocations"),
        );
        setRoleBreakupData(formatExperienceDataset(response?.roleBreakup));
        setOverallSkillData(
          formatSkillDataset(response?.overallEmployeeSkills?.employeeSkillCount),
        );
      })
      .catch((errResponse) => toast.error(errResponse))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [
    projectAllocationSortValue,
    roleBreakupSortValue,
    overallSkillsSortValue,
    chartOptionSelected,
    choiceValue,
  ]);

  if (isLoading) return <Spinner />;

  return (
    <Wrapper elementId="top">
      <div className="row" id="top">
        <div
          className={`col-xl-12 ${
            isMobile ? "flex-col" : "flex align-center justify-between"
          }`}
        >
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Project Allocation
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
            labels={projectAllocationData?.labels}
            dataValues={projectAllocationData?.dataValues}
            graphConfig={countGraph}
            isAscendingOrder={projectAllocationSortValue}
            updateSortOrder={(value) => setSortAscOrder({ projectAllocation: value })}
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
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Role Breakup
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={roleBreakupData?.labels}
            dataValues={roleBreakupData?.dataValues}
            graphConfig={yoeGraph}
            isAscendingOrder={roleBreakupSortValue}
            updateSortOrder={(value) => setSortAscOrder({ roleBreakup: value })}
            showLegend
            showSorting
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
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
            updateSortOrder={(value) =>
              setSortAscOrder({ currentAllocOverallSkills: value })
            }
            showLegend
            showSorting
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default CurrentAllocation;
