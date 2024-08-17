import {
  Badge,
  Button,
  Divider,
  Heading,
  ReactSelect,
  Spinner,
  Text,
  Tooltip,
} from "@allocate-core/ui-components";
import { ArcElement, Chart } from "chart.js";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import BackArrow from "/icons/arrow-right.svg";
import ArrowBlueFilled from "/icons/arrowBlueFilled.svg";

import { getTalentById, updateTalent } from "../../../api/talent";
import { isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import Wrapper from "../../../components/Layout/Wrapper";
import PermissionGate, { getPermission } from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import talentStatus from "../../../constants/talentStatus";
import { useCommonStore } from "../../../store/commonStore";
import BasicDetails from "./BasicDetails";
import ExperienceDetails from "./ExperienceDetails";
import ProjectDetails from "./ProjectDetails";
import TableData from "./TableData";
import styles from "./talentDetails.module.css";

Chart.register(ArcElement);

const TalentStatusOptions = talentStatus.map((status) => ({
  ...status,
  label: <Badge variant={status.color}>{status.uiString}</Badge>,
}));

const mobileTabs = [
  "Basic Details",
  "Experience Details",
  "Project Details",
  "Asset Details",
];

const cafeOption = TalentStatusOptions.find((status) => status?.value === "Cafe");

const TalentDetails = () => {
  const { id: talentId } = useParams();
  const showTable = false;
  const [talentDetails, setTalentDetails] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [statusValue, setStatusValue] = useState(null);
  const [refetch, setRefetch] = useState(true);
  const navigate = useNavigate();
  const [isClearable, setIsClearable] = useState(true);
  const setHasNavigatedBack = useCommonStore(
    (state) => state.setHasNavigatedBack,
    shallow,
  );
  const hasPermission = getPermission([SCOPES.canUpdatePeopleDetails]);

  const onBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setHasNavigatedBack(true);
  }, []);

  useEffect(() => {
    setRefetch(true);
  }, [talentId]);

  useEffect(() => {
    if (refetch) {
      setIsLoading(true);
      getTalentById(talentId)
        .then((response) => {
          setTalentDetails(response.user);
          setStatusValue(
            TalentStatusOptions.find(
              (status) => status.value === response.user.currentStatus,
            ),
          );
        })
        .catch((errorResponse) => toast.error(errorResponse?.data?.detail))
        .finally(() => {
          setIsLoading(false);
          setRefetch(false);
        });
    }
  }, [refetch]);

  useEffect(() => {
    if (statusValue)
      handleEdit(talentId, {
        status: statusValue?.value,
      }).catch((errorResponse) => toast.error(errorResponse?.data?.detail));
    setIsClearable(
      statusValue?.value !== "Cafe" &&
        statusValue?.value !== "Fully_Allocated" &&
        statusValue?.value !== "Serving NP",
    );
  }, [statusValue]);

  const handleEdit = (id, payload) => {
    if (hasPermission) return updateTalent(id, payload);
    return Promise.reject();
  };

  const doughnutChartData = {
    labels: ["Utilization", "Availability"],
    datasets: [
      {
        labels: "%",
        data: [talentDetails?.totalUtilized, 100 - talentDetails?.totalUtilized],
        backgroundColor: ["#FC8C8C", "#91ECCD"],
        borderColor: "#FFFFFF",
        borderWidth: 0,
        cutout: "50%",
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  if (isLoading) return <Spinner />;

  return (
    <Wrapper elementId="talent-heading">
      <div className={styles.mainSection}>
        <header className="hidden-md-up">
          <Header>
            <div className="flex gap-30 align-center">
              <img
                src={BackArrow}
                alt="back button arrow"
                role="presentation"
                onClick={onBack}
              />
              <Heading size="h6" fontWeight="medium" id="talent-heading">
                Talent Details
              </Heading>
            </div>
          </Header>
        </header>
        <Text size="b2" className="hidden-sm-down" id="talent-heading">
          People / View Details
        </Text>
        <header className={`flex align-center gap-10 ${styles.header}`}>
          <Heading
            as="h1"
            size={isMobile ? "h5" : "h4"}
            fontWeight={isMobile ? "medium" : "bold"}
            className={`${styles.talentName} ${
              talentDetails?.currentStatus === "Closed" ? styles.nonActive : ""
            }`}
          >
            {talentDetails?.fullNameWithExpBand}
          </Heading>
          <div className={`${isMobile && "ml-auto"}`}>
            <Tooltip
              content={
                <div>
                  <Text className="flex justify-between gap-10" size="b3">
                    <span>Utilization:</span>
                    <span>{talentDetails?.totalUtilized || 0}%</span>
                  </Text>
                  <Text className="flex justify-between gap-10" size="b3">
                    <span>Availability:</span>
                    <span>{100 - talentDetails?.totalUtilized}%</span>
                  </Text>
                </div>
              }
            >
              <div className={styles.utilizationIcon}>
                <Doughnut data={doughnutChartData} options={doughnutOptions} />
              </div>
            </Tooltip>
          </div>
          <div className="col-xl-3 px-0">
            <PermissionGate
              scopes={[SCOPES.canUpdatePeopleDetails]}
              showPermittedElement
              permittedElement={(hasPermission) => (
                <ReactSelect
                  value={statusValue}
                  isClearable={isClearable}
                  options={TalentStatusOptions.filter((options) =>
                    talentDetails?.currentStatus === "Closed"
                      ? options.color === "red"
                      : options.color === "green" &&
                        !(
                          options.value === "Fully_Allocated" ||
                          options.value === "Cafe" ||
                          options.value === "Serving NP"
                        ),
                  )}
                  onChange={(value) => {
                    setStatusValue(value ?? cafeOption);
                  }}
                  isDisabled={!hasPermission || talentDetails?.currentStatus === "Closed"}
                />
              )}
            />
          </div>
        </header>

        <div className="row justify-content-between hidden-sm-down">
          <div className="col-6">
            <BasicDetails
              talentDetails={talentDetails}
              handleEdit={handleEdit}
              setRefetch={setRefetch}
            />
          </div>
          <div className="col-6">
            <ExperienceDetails
              talentDetails={talentDetails}
              handleEdit={handleEdit}
              setRefetch={setRefetch}
            />
          </div>
        </div>

        <div className="hidden-md-up flex-center gap-20 pt-20">
          <Button
            onClick={() => {
              setCurrentTab((current) => (current === 0 ? 0 : current - 1));
            }}
            className={currentTab === 0 ? styles.inactive : ""}
          >
            <img src={ArrowBlueFilled} alt="View previous Role" />
          </Button>
          <Text size="b1" fontWeight="regular">
            {mobileTabs[currentTab]}
          </Text>
          <Button
            className={currentTab === mobileTabs.length - 1 ? styles.inactive : ""}
            onClick={() => {
              setCurrentTab((current) =>
                current === mobileTabs.length - 1 ? mobileTabs.length - 1 : current + 1,
              );
            }}
          >
            <img
              className={styles.arrowRight}
              src={ArrowBlueFilled}
              alt="view next month"
            />
          </Button>
        </div>
        {isMobile ? (
          <React.Fragment>
            {mobileTabs[currentTab] === "Basic Details" && (
              <BasicDetails
                talentDetails={talentDetails}
                handleEdit={handleEdit}
                setRefetch={setRefetch}
              />
            )}
            {mobileTabs[currentTab] === "Experience Details" && (
              <ExperienceDetails
                talentDetails={talentDetails}
                handleEdit={handleEdit}
                setRefetch={setRefetch}
              />
            )}
            {mobileTabs[currentTab] === "Project Details" && (
              <ProjectDetails
                currentProjects={talentDetails?.currentProjects}
                pastProjects={talentDetails?.pastProjects}
              />
            )}
            {mobileTabs[currentTab] === "Asset Details" && (
              <Text className="flex-center mt-16">No data to Display</Text>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Divider />

            <TableData
              data={talentDetails?.currentProjects}
              forProject={true}
              heading="Current Project(s)"
            />

            <Divider />

            <TableData
              data={talentDetails?.pastProjects}
              forProject={true}
              heading="Past Project(s)"
              toggleButton={showTable}
            />

            <Divider />

            <TableData
              data={[]}
              forProject={false}
              heading="Currently Allocated Asset(s)"
              toggleButton={showTable}
            />

            <Divider />

            <TableData
              data={[]}
              forProject={false}
              heading="Past Asset(s)"
              toggleButton={showTable}
            />
          </React.Fragment>
        )}
      </div>
    </Wrapper>
  );
};

export default TalentDetails;
