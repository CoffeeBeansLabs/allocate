import { Button, Modal, Text } from "@allocate-core/ui-components";
import React from "react";
import { toast } from "react-toastify";

import { deleteProjectRole } from "../../../api/projects";
import { isMobile } from "../../../common/common";
import MobileModal from "../../../components/MobileModal/MobileModal";

const RemoveBody = ({ roleName, onCancel, onConfirm }) => {
  return (
    <React.Fragment>
      <Text size="b1" fontWeight="medium">
        {`Do you want to remove ${roleName} role from the project?`}
      </Text>
      <div className="flex gap-10 mt-16 pt-20">
        <Button variant="secondary" className="ml-auto" onClick={onCancel}>
          <Text size="b2" fontWeight="medium">
            Not Yet
          </Text>
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          <Text size="b2" fontWeight="medium">
            Yes, Remove
          </Text>
        </Button>
      </div>
    </React.Fragment>
  );
};

const RemoveRoleModal = ({ isOpen, role, onCancel, onConfirm }) => {
  const handleRemoveTalent = () => {
    deleteProjectRole(role?.id)
      .then(() => {
        toast.success("Role Removed");
        onConfirm();
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data.detail);
        onCancel();
      });
  };

  return isMobile ? (
    <MobileModal
      size="sm"
      isOpen={isOpen}
      showCloseBtn={false}
      isFullScreen={false}
      showTitle={true}
      title="Remove Role"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
    >
      <RemoveBody
        roleName={role?.name}
        onConfirm={handleRemoveTalent}
        onCancel={onCancel}
      />
    </MobileModal>
  ) : (
    <Modal
      size="sm"
      isOpen={isOpen}
      showCloseBtn={false}
      title="Remove Role"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
      isMobile={isMobile}
    >
      <RemoveBody
        roleName={role?.name}
        onConfirm={handleRemoveTalent}
        onCancel={onCancel}
      />
    </Modal>
  );
};

export default RemoveRoleModal;
