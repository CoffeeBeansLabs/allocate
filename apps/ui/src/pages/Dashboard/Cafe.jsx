import { Heading, Spinner } from "@allocate-core/ui-components";
import { formatSkillDataset } from "@allocate-core/util-formatting";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import { getCafeAndPotentialData } from "../../api/dashboard";
import { getCafeReport, getPotentialCafeReport } from "../../api/report";
import { isMobile } from "../../common/common";
import Wrapper from "../../components/Layout/Wrapper";
import skillGraph from "../../constants/skillGraph";
import { useDashboardStore } from "../../store/dashboardStore";
import BarGraph from "./components/BarGraph";
import Report from "./components/Report";
import styles from "./dashboard.module.css";

const Cafe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cafeSkillData, setCafeSkillData] = useDashboardStore(
    (state) => [state.cafeSkillData, state.setCafeSkillData],
    shallow,
  );
  const [potentialCafeSkillData, setPotentialCafeSkillData] = useDashboardStore(
    (state) => [state.potentialCafeSkillData, state.setPotentialCafeSkillData],
    shallow,
  );
  const setSortAscOrder = useDashboardStore((state) => state.setSortAscOrder);
  const cafeSkillsSortValue = useDashboardStore(
    (state) => state.sortAscOrder.cafeAndPotentialCafeSkills,
    shallow,
  );
  const potentialCafeSkillSortValue = useDashboardStore(
    (state) => state.sortAscOrder.potentialCafeSkill,
    shallow,
  );

  const fetchData = () => {
    setIsLoading(true);
    getCafeAndPotentialData({
      cafe_sort_ascending: cafeSkillsSortValue,
      potential_cafe_sort_ascending: potentialCafeSkillSortValue,
    })
      .then((response) => {
        setCafeSkillData(
          formatSkillDataset(response?.cafeEmployeeSkills?.employeeSkillCount),
        );
        setPotentialCafeSkillData(
          formatSkillDataset(response?.potentialCafeEmployeeSkills?.employeeSkillCount),
        );
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [cafeSkillsSortValue, potentialCafeSkillSortValue]);

  if (isLoading) return <Spinner />;
  return (
    <Wrapper elementId="top">
      <div className="row" id="top">
        <div className="col-xl-12 flex">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Cafe - Skills & Proficiency
          </Heading>
          <div className="ml-auto">
            <Report
              dataFunction={getCafeReport}
              filename="cafe"
              showDateRange
              datesRequired
            />
          </div>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={cafeSkillData?.labels}
            dataValues={cafeSkillData?.dataValues}
            graphConfig={skillGraph}
            isAscendingOrder={cafeSkillsSortValue}
            updateSortOrder={(value) =>
              setSortAscOrder({ cafeAndPotentialCafeSkills: value })
            }
            showLegend
            showSorting
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className="col-xl-12 flex">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Potential Cafe - Skills & Proficiency
          </Heading>
          <div className="ml-auto">
            <Report dataFunction={getPotentialCafeReport} filename="potentialCafe" />
          </div>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={potentialCafeSkillData?.labels}
            dataValues={potentialCafeSkillData?.dataValues}
            graphConfig={skillGraph}
            isAscendingOrder={potentialCafeSkillSortValue}
            updateSortOrder={(value) => setSortAscOrder({ potentialCafeSkill: value })}
            showLegend
            showSorting
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default Cafe;
