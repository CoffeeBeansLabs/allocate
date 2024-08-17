import {
  Button,
  Divider,
  Heading,
  InfoRow,
  Modal,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import BackArrow from "/icons/arrow-right.svg";
import EditIcon from "/icons/editIcon.svg";

import { getProjectById } from "../../../api/projects";
import Header from "../../../components/Header";
import Wrapper from "../../../components/Layout/Wrapper";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import StatusIcons from "../../../constants/status";
import ProjectForm from "../ProjectForm";
import styles from "./projectDetails.module.css";

export const formatProjectDetails = (project) => {
  const statusInfo = StatusIcons.find((status) => status.type == project?.status);
  return {
    ...project,
    clientName: project?.client?.name,
    startDate: project?.startDate,
    endDate: project?.endDate,
    pocName: project?.pocs?.[0]?.name,
    pocEmail: project?.pocs?.[0]?.email,
    pocPhoneNumber: project?.pocs?.[0]?.phoneNumber,
    pocDesignation: project?.pocs?.[0]?.designation,
    statusIcon: statusInfo?.icon,
    accountManager: project?.accountManager?.fullNameWithExpBand,
  };
};

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState({});
  const [formDirty, setFormDirty] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    getProjectById(projectId)
      .then((response) => {
        setProjectDetails(formatProjectDetails(response.project));
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail, {
          autoClose: 2000,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isEditProjectModalOpen, projectId]);

  const onSuccessHandler = () => {
    setIsEditProjectModalOpen(false);
    toast.success("Project Edited!");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Wrapper elementId="project-heading">
      <section className={styles.mainSection}>
        <Header className="row">
          <img
            src={BackArrow}
            alt="back button arrow"
            role="presentation"
            onClick={() => navigate(-1)}
          />
          <Heading size="h6" fontWeight="medium">
            {projectDetails?.name}
          </Heading>
          <PermissionGate
            scopes={[SCOPES.canUpdate]}
            permittedElement={() => (
              <img
                role="presentation"
                src={EditIcon}
                alt="edit button"
                className="ml-auto"
                onClick={() => {
                  setIsEditProjectModalOpen(true);
                }}
              />
            )}
          />
        </Header>
        <Text
          size="b2"
          className={`hidden-sm-down ${styles.pagePosition}`}
          id="project-heading"
        >
          Projects / View Details
        </Text>
        <header className={`flex-center hidden-sm-down ${styles.header}`}>
          <div className={`flex-center gap-10`}>
            <Heading
              as="h1"
              size="h4"
              fontWeight="bold"
              className={`${styles.titleName}`}
            >
              {projectDetails?.name}
            </Heading>
            <img
              src={projectDetails?.statusIcon}
              alt="status icon"
              className={styles.iconImage}
            />
          </div>
          <div className="col-xl-3 ml-auto">
            <PermissionGate
              scopes={[SCOPES.canUpdate]}
              showPermittedElement
              permittedElement={(hasPermission) => (
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => {
                    setIsEditProjectModalOpen(true);
                  }}
                  disabled={!hasPermission}
                >
                  <img src={EditIcon} alt="Edit Icon" className={styles.buttonIcon} />
                  <Text size="b2" fontWeight="medium">
                    Edit
                  </Text>
                </Button>
              )}
            />
          </div>
          <div className="col-xl-2">
            <Link to={`/projects/timeline/${projectId}`}>
              <Button variant="secondary">
                <Text size="b2" fontWeight="medium">
                  Project Timeline
                </Text>
              </Button>
            </Link>
          </div>
        </header>
        <section className={styles.projectDetails} id="project-heading">
          <InfoRow
            title="Project Name"
            titleStyle="col-xl-3"
            value={projectDetails?.name || "--"}
            valueStyle={"col-xl-4"}
            className="hidden-sm-down"
          />
          <InfoRow
            title="Client"
            titleStyle="col-xl-3"
            value={projectDetails?.clientName || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Type of Engagement"
            titleStyle="col-xl-3"
            value={projectDetails?.engagementType || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Currency"
            titleStyle="col-xl-3"
            value={projectDetails?.currency || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Country"
            titleStyle="col-xl-3"
            value={projectDetails?.country || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="City"
            titleStyle="col-xl-3"
            value={projectDetails?.city || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Delivery Mode"
            titleStyle="col-xl-3"
            value={projectDetails?.deliveryMode || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Start Date"
            titleStyle="col-xl-3"
            value={getFormatedDate(projectDetails?.startDate) || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="End Date"
            titleStyle="col-xl-3"
            value={getFormatedDate(projectDetails?.endDate) || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Remarks"
            titleStyle="col-xl-3"
            value={projectDetails?.comment || "--"}
            valueStyle="col-xl-4"
          />
        </section>
        <Divider />
        <section>
          <Heading size="h6" className={styles.sectionTitle}>
            Client POC
          </Heading>
          <InfoRow
            title="Name"
            titleStyle="col-xl-2"
            value={projectDetails?.pocName || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Email"
            titleStyle="col-xl-2"
            value={projectDetails?.pocEmail || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title="Phone Number"
            titleStyle="col-xl-2"
            value={projectDetails?.pocPhoneNumber || "--"}
            valueStyle="col-xl-4"
          />
          <InfoRow
            title={"Designation"}
            titleStyle={"col-xl-2"}
            value={projectDetails?.pocDesignation || "--"}
            valueStyle={"col-xl-4"}
          />
        </section>
        <Divider />
        <section>
          <Heading size="h6" className={styles.sectionTitle}>
            Account Manager
          </Heading>
          <InfoRow
            title="Name"
            titleStyle="col-xl-2"
            value={projectDetails?.accountManager || "--"}
            valueStyle="col-xl-4"
          />
        </section>
        <Modal
          title="Edit Details"
          size="md"
          isOpen={isEditProjectModalOpen}
          onClose={() => {
            setIsEditProjectModalOpen(false);
          }}
          showOnCloseAlert={formDirty}
          preventCloseOnOutsideClick={true}
        >
          <ProjectForm
            type="edit"
            onSubmit={onSuccessHandler}
            data={projectDetails}
            setFormDirty={setFormDirty}
          />
        </Modal>
      </section>
    </Wrapper>
  );
};

export default ProjectDetails;
