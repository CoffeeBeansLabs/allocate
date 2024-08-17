import { Heading, Spinner } from "@allocate-core/ui-components";
import { formatCountDataset } from "@allocate-core/util-formatting";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import { getClientAndProjectlData } from "../../api/dashboard";
import { getClientAllocationReport } from "../../api/report";
import { isMobile } from "../../common/common";
import Wrapper from "../../components/Layout/Wrapper";
import { useDashboardStore } from "../../store/dashboardStore";
import BarGraph from "./components/BarGraph";
import Report from "./components/Report";
import styles from "./dashboard.module.css";

const ClientProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clientIndustryData, setClientIndustryData] = useDashboardStore(
    (state) => [state.clientIndustryData, state.setClientIndustryData],
    shallow,
  );
  const [clientAllocationData, setClientAllocationData] = useDashboardStore(
    (state) => [state.clientAllocationData, state.setClientAllocationData],
    shallow,
  );
  const setSortAscOrder = useDashboardStore((state) => state.setSortAscOrder);
  const clientIndustriesSortValue = useDashboardStore(
    (state) => state.sortAscOrder.clientIndustry,
    shallow,
  );
  const clientAllocationSortValue = useDashboardStore(
    (state) => state.sortAscOrder.clientAllocation,
    shallow,
  );

  const fetchData = () => {
    setIsLoading(true);
    getClientAndProjectlData({
      industries_sort_ascending: clientIndustriesSortValue,
      allocation_sort_ascending: clientAllocationSortValue,
    })
      .then((response) => {
        setClientAllocationData(
          formatCountDataset(response?.clients, "name", "allocatedUsers"),
        );
        setClientIndustryData(
          formatCountDataset(response?.industryCount, "name", "clientCount"),
        );
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [clientIndustriesSortValue, clientAllocationSortValue]);

  if (isLoading) return <Spinner />;
  return (
    <Wrapper elementId="top">
      <div className="row" id="top">
        <div className="col-xl-12">
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Client Industries
          </Heading>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={clientIndustryData?.labels}
            dataValues={clientIndustryData?.dataValues}
            graphConfig={[{ label: null, color: "#F9A41A" }]}
            isAscendingOrder={clientIndustriesSortValue}
            updateSortOrder={(value) => setSortAscOrder({ clientIndustry: value })}
            showSorting
          />
        </div>
      </div>
      <div className={`row ${styles.subSectionTitle}`}>
        <div className={`col-xl-12 ${isMobile ? "flex-col" : "flex"}`}>
          <Heading as="h1" size={isMobile ? "h6" : "h5"} fontWeight="bold">
            Client Allocation
          </Heading>
          <div className={isMobile ? "mt-16" : "ml-auto"}>
            <Report
              dataFunction={getClientAllocationReport}
              filename="client"
              showDateRange
              datesRequired
            />
          </div>
        </div>
        <div className="col-xl-12 pt-20">
          <BarGraph
            labels={clientAllocationData?.labels}
            dataValues={clientAllocationData?.dataValues}
            graphConfig={[{ label: null, color: "#4CBD97" }]}
            isAscendingOrder={clientAllocationSortValue}
            updateSortOrder={(value) => setSortAscOrder({ clientAllocation: value })}
            showSorting
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default ClientProject;
