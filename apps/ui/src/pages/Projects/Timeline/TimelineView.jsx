import "react-toastify/dist/ReactToastify.css";

import { Button, Modal, Text } from "@allocate-core/ui-components";
import { formatProjectTimeline } from "@allocate-core/util-formatting";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import BinIconRed from "/icons/binIconRed.svg";
import ChevronRight from "/icons/chevron.svg";
import EditIcon from "/icons/editIcon.svg";
import SearchBlueIcon from "/icons/searchBlueIcon.svg";

import {
  removeAllocationRequest,
  updateAllocationRequestStatus,
} from "../../../api/projects";
import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import MobileTalentInfo from "../../../components/SkillsCard/MobileTalentInfo";
import TalentItem from "../../../components/TalentItem";
import Legends from "../../../components/Timeline/Legends";
import { SCOPES } from "../../../constants/roles";
import { useRecommendationStore } from "../../../store/recommendationStore";
import ManageTalentModal from "../components/ManageTalentModal";
import PositionCard from "../components/PositionCard";
import PositionIcon from "../components/PositionIcon";
import RemoveRoleModal from "../components/RemoveRoleModal";
import RemoveTalentModal from "../components/RemoveTalentModal";
import RolesForm from "./RolesForm";
import Timeline from "./Timeline";
import styles from "./timeline.module.css";

export const TimelineView = ({
  onAddRole,
  projectDetails,
  projectTimeline,
  isEditRolesModalOpen,
  setIsEditRolesModalOpen,
  isAddRolesModalOpen,
  setIsAddRolesModalOpen,
  setRefetch,
}) => {
  const [editRoleValues, setEditRoleValues] = useState();
  const [isManageTalentModalOpen, setIsManageTalentModalOpen] = useState(false);
  const [isRemoveTalentModalOpen, setIsRemoveTalentModalOpen] = useState(false);
  const [talentsToManage, setTalentsToManage] = useState([]);
  const [talentToRemove, setTalentToRemove] = useState();
  const [managePosition, setManagePosition] = useState();
  const [timelineMonth, setTimelineMonth] = useState(0);
  const [formDirty, setFormDirty] = useState(false);
  const [timelineData, setTimelineData] = useState(
    formatProjectTimeline(projectTimeline, timelineMonth),
  );
  const resetRecommendationStore = useRecommendationStore((state) => state.resetStore);
  const [isRemoveRoleModalOpen, setIsRemoveRoleModalOpen] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState(null);

  const { startDate, endDate } = projectDetails;

  useEffect(() => {
    setTimelineData(formatProjectTimeline(projectTimeline, timelineMonth));
  }, [projectTimeline, timelineMonth]);

  const onRequestCancel = (requestId) => {
    removeAllocationRequest(requestId)
      .then(() => {
        toast.success("Talent request cancelled");
        setRefetch(true);
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data.detail);
        setRefetch(true);
      });
  };
  const onApprove = (requestId) => {
    const payload = {
      status: "APPROVED",
    };

    updateAllocationRequestStatus(requestId, payload)
      .then(() => {
        toast.success("Talent request Approved");
        setRefetch(true);
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail);
        setRefetch(true);
      });
  };
  const onDeny = (requestId) => {
    const payload = {
      status: "DENIED",
    };

    updateAllocationRequestStatus(requestId, payload)
      .then(() => {
        toast.success("Talent request Denied");
        setRefetch(true);
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail);
        setRefetch(true);
      });
  };

  const handleManageTalent = (users, position) => {
    setTalentsToManage(formatManageTalentData(users, position));
    setIsManageTalentModalOpen(true);
    setRefetch(false);
  };

  const formatManageTalentData = (talentData, position) => {
    return talentData.reduce((acc, talent) => {
      const currentProjects = talent.projects?.filter(
        (project) => project?.isSameProject && project?.positionId === position?.id,
      );

      if (currentProjects)
        currentProjects.map((project) =>
          acc.push({
            id: talent?.id,
            name: talent?.fullNameWithExpBand,
            allocationId: project?.id,
            allocation: project?.utilization,
            allocationTill: project?.endDate,
            allocationFrom: project?.startDate,
            positionTill: position.endDate,
          }),
        );
      return acc;
    }, []);
  };

  return (
    <section className={styles.timelineWrapper}>
      <aside className={styles.rolesSectionWrapper}>
        {timelineData?.roles?.map((role) => {
          const handleEditRoleClick = () => {
            const currentRoleAllData = projectTimeline?.roles?.find(
              (roleItem) => role.roleName === roleItem.roleName,
            );
            setEditRoleValues(currentRoleAllData);
            setIsEditRolesModalOpen(true);
            setRefetch(false);
          };
          const handleDeleteRoleClick = () => {
            setRoleToRemove({ id: role.projectRoleId, name: role.roleName });
            setIsRemoveRoleModalOpen(true);
            setRefetch(false);
          };

          return (
            <div key={role.projectRoleId} className={styles.roleCard}>
              <div className={styles.roleSection}>
                <div>
                  <Text as="div" size="b1" fontWeight="semibold">
                    {role.roleName}
                  </Text>
                  <Text size="b3" fontWeight="medium" style={{ color: "#6B7280" }}>
                    {`${role?.totalPositions - role?.openPositions || 0} / ${
                      role?.totalPositions
                    } Filled`}
                  </Text>
                </div>
                <div className="ml-auto flex gap-20">
                  <PermissionGate
                    scopes={[SCOPES.canDelete]}
                    permittedElement={() => (
                      <div
                        role="button"
                        onClick={handleDeleteRoleClick}
                        onKeyDown={handleDeleteRoleClick}
                        tabIndex={0}
                        className={styles.editRoleIcon}
                      >
                        <img src={BinIconRed} alt="delete role button" />
                      </div>
                    )}
                  />
                  <PermissionGate
                    scopes={[SCOPES.canUpdate]}
                    permittedElement={() => (
                      <div
                        role="button"
                        onClick={handleEditRoleClick}
                        onKeyDown={handleEditRoleClick}
                        tabIndex={0}
                        className={styles.editRoleIcon}
                      >
                        <img src={EditIcon} alt="edit role button" />
                      </div>
                    )}
                  />
                </div>
              </div>
              {role.positions?.map((position) => {
                const currentPositionAllData = projectTimeline?.roles
                  ?.find((roleItem) => role.roleName === roleItem.roleName)
                  .positions?.find((positionItem) => positionItem.id === position.id);
                return (
                  <div key={position.id} className={styles.positionItemContainer}>
                    <div className={styles.positionItem}>
                      <div className={styles.positionName}>
                        <PositionCard
                          criteria={{ ...position, role: role?.roleName }}
                          positionName={`Position ${position.positionNo}`}
                          onManageClick={() =>
                            handleManageTalent(currentPositionAllData?.users, position)
                          }
                        />
                        <img
                          src={ChevronRight}
                          className={styles.chevronRight}
                          alt="Opens detailed view of position"
                          role="presentation"
                          onClick={() => {
                            if (isMobile) {
                              handleManageTalent(currentPositionAllData?.users, position);
                              setManagePosition({ ...position, role: role?.roleName });
                            }
                          }}
                        />
                        <PositionIcon
                          positionData={currentPositionAllData}
                          month={timelineMonth}
                        />
                      </div>
                      <Link
                        to={`/projects/recommendations/${projectDetails?.id}/${position.id}/`}
                      >
                        <Button
                          className="pa-0"
                          onClick={() => resetRecommendationStore()}
                        >
                          <img
                            src={SearchBlueIcon}
                            alt="search for talents, who match this position"
                          />
                        </Button>
                      </Link>
                    </div>
                    {position?.users?.map((user, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex-col">
                          <TalentItem
                            divStyle={`flex gap-10 ${styles.leftPanelItem}`}
                            talentData={{
                              ...user,
                              name: user?.fullNameWithExpBand,
                              role: user?.role?.name,
                            }}
                            buttonComponent={
                              <div className="col flex align-center gap-10">
                                {user.requests.length > 0 && (
                                  <>
                                    <PermissionGate
                                      scopes={[SCOPES.canAddTalent]}
                                      permittedElement={() => (
                                        <div
                                          className={`mr-0 ${styles.positionRequest}`}
                                          style={{
                                            background: "var(--color-VividCerulean)",
                                          }}
                                        >
                                          <Text size="b4" fontWeight="medium">
                                            Proposed
                                          </Text>
                                        </div>
                                      )}
                                    />
                                    <PermissionGate
                                      scopes={[SCOPES.canRequestTalent]}
                                      permittedElement={() => (
                                        <div className={`mr-0 ${styles.positionRequest}`}>
                                          <Text size="b4" fontWeight="medium">
                                            Requested
                                          </Text>
                                        </div>
                                      )}
                                    />
                                  </>
                                )}
                              </div>
                            }
                          >
                            <MobileTalentInfo
                              userDetails={user}
                              showLeavesAndRequests
                              showCompactSkillView
                              criteria={user}
                            />
                          </TalentItem>
                        </div>
                        {user.requests.length > 0 && (
                          <>
                            <PermissionGate
                              scopes={[SCOPES.canAddTalent]}
                              permittedElement={() => (
                                <div
                                  className={`col flex gap-10 ${styles.approvalBtnContainer}`}
                                >
                                  <Button
                                    variant="secondary"
                                    color="red"
                                    size="sm"
                                    onClick={() => onDeny(user?.requests[0]?.id)}
                                  >
                                    <Text size="b2" fontWeight="semibold">
                                      Deny
                                    </Text>
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    color="green"
                                    size="sm"
                                    onClick={() => onApprove(user?.requests[0]?.id)}
                                  >
                                    <Text size="b2" fontWeight="semibold">
                                      Approve
                                    </Text>
                                  </Button>
                                </div>
                              )}
                            />
                            <PermissionGate
                              scopes={[SCOPES.canRequestTalent]}
                              permittedElement={() => (
                                <div className={`col ${styles.approvalBtnContainer}`}>
                                  <Button
                                    variant="secondary"
                                    color="red"
                                    size="sm"
                                    onClick={() => onRequestCancel(user?.requests[0]?.id)}
                                  >
                                    <Text size="b2" fontWeight="semibold">
                                      Cancel request
                                    </Text>
                                  </Button>
                                </div>
                              )}
                            />
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </aside>

      <div className="flex-col text-center">
        <Timeline timelineData={timelineData} setTimelineMonth={setTimelineMonth} />
        <Legends
          currentProject={projectDetails?.name}
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "#FFFFFF",
            zIndex: 35,
          }}
        />
      </div>

      <Modal
        size="lg"
        title="Edit Roles"
        isOpen={isEditRolesModalOpen}
        onClose={() => {
          setIsEditRolesModalOpen(false);
          setRefetch(true);
        }}
        preventCloseOnOutsideClick={true}
        isMobile={isMobile}
      >
        <RolesForm
          type="edit"
          data={editRoleValues}
          onCreateSubmit={onAddRole}
          projectStartDate={startDate}
          projectEndDate={endDate}
        />
      </Modal>

      <Modal
        size="lg"
        title="Add Roles"
        isOpen={isAddRolesModalOpen}
        onClose={() => {
          setIsAddRolesModalOpen(false);
        }}
        showOnCloseAlert={formDirty}
        preventCloseOnOutsideClick={true}
        isMobile={isMobile}
      >
        <RolesForm
          onCreateSubmit={onAddRole}
          setFormDirty={setFormDirty}
          projectStartDate={startDate}
          projectEndDate={endDate}
        />
      </Modal>

      <ManageTalentModal
        isOpen={isManageTalentModalOpen}
        data={talentsToManage}
        criteria={managePosition}
        onClose={() => {
          setIsManageTalentModalOpen(false);
          setRefetch(true);
        }}
        onRemove={(e, talent) => {
          e.preventDefault();
          setIsManageTalentModalOpen(false);
          setIsRemoveTalentModalOpen(true);
          setTalentToRemove(talent);
        }}
      />
      <RemoveTalentModal
        isOpen={isRemoveTalentModalOpen}
        talent={talentToRemove}
        onCancel={() => {
          setIsRemoveTalentModalOpen(false);
          setRefetch(true);
        }}
        onConfirm={() => {
          setIsRemoveTalentModalOpen(false);
          setRefetch(true);
        }}
      />
      <RemoveRoleModal
        isOpen={isRemoveRoleModalOpen}
        role={roleToRemove}
        onCancel={() => {
          setIsRemoveRoleModalOpen(false);
          setRefetch(true);
        }}
        onConfirm={() => {
          setIsRemoveRoleModalOpen(false);
          setRefetch(true);
        }}
      />
    </section>
  );
};

export default TimelineView;

TimelineView.propTypes = {
  onAddRole: PropTypes.func.isRequired,
  projectDetails: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
  }).isRequired,
  projectTimeline: PropTypes.shape({
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        projectRoleId: PropTypes.number.isRequired,
        roleName: PropTypes.string.isRequired,
        totalPositions: PropTypes.number.isRequired,
        openPositions: PropTypes.number.isRequired,
        positions: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number.isRequired,
            positionNo: PropTypes.number.isRequired,
            users: PropTypes.arrayOf(
              PropTypes.shape({
                id: PropTypes.number,
                fullNameWithExpBand: PropTypes.string,
                role: PropTypes.shape({
                  name: PropTypes.string.isRequired,
                }),
                requests: PropTypes.arrayOf(
                  PropTypes.shape({
                    id: PropTypes.number,
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    ),
  }).isRequired,
  isEditRolesModalOpen: PropTypes.bool.isRequired,
  setIsEditRolesModalOpen: PropTypes.func.isRequired,
  isAddRolesModalOpen: PropTypes.bool.isRequired,
  setIsAddRolesModalOpen: PropTypes.func.isRequired,
  setRefetch: PropTypes.func.isRequired,
};
