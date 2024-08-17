import "react-toastify/dist/ReactToastify.css";

import { Button, Heading, Modal, Text } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useState } from "react";

import AddIcon from "/icons/addWhite.svg";
import NoRolesImage from "/images/noRoles.png";

import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import RolesForm from "./RolesForm";
import styles from "./timeline.module.css";

const AddRolesView = ({
  onAddRole,
  isAddRolesModalOpen,
  setIsAddRolesModalOpen,
  projectDetails,
}) => {
  const [formDirty, setFormDirty] = useState(false);

  const { startDate, endDate } = projectDetails;

  return (
    <section className={styles.placeholderBody}>
      <div className="flex-col flex-center">
        <div className={styles.placeholderImage}>
          <img
            src={NoRolesImage}
            alt="A woman and a man rearranging profile cards while marking them"
          />
        </div>
        <Heading size="h6" fontWeight="medium" className={isMobile ? "show" : "hide"}>
          No roles added yet
        </Heading>
        <PermissionGate
          scopes={[SCOPES.canCreate]}
          showPermittedElement
          permittedElement={(hasPermission) => (
            <Button
              variant="primary"
              onClick={() => {
                setIsAddRolesModalOpen(true);
              }}
              className={styles.addRoleBtn}
              disabled={projectDetails?.status === "CLOSED" || !hasPermission}
            >
              <img src={AddIcon} alt="plus icon for add" />
              {!isMobile && (
                <Text size="b2" fontWeight="semibold">
                  Add Roles
                </Text>
              )}
            </Button>
          )}
        />
      </div>
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
    </section>
  );
};

AddRolesView.propTypes = {
  onAddRole: PropTypes.func.isRequired,
  isAddRolesModalOpen: PropTypes.bool.isRequired,
  setIsAddRolesModalOpen: PropTypes.func.isRequired,
  projectDetails: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default AddRolesView;
