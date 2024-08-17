import { Button, Modal, Text } from "@allocate-core/ui-components";
import React from "react";
import { toast } from "react-toastify";

import { removeTalent } from "../../../api/projects";
import { isMobile } from "../../../common/common";
import MobileModal from "../../../components/MobileModal/MobileModal";

const RemoveBody = ({ talent, onCancel, onConfirm }) => {
  return (
    <React.Fragment>
      <Text size="b1" fontWeight="medium">
        {`Do you want to remove ${talent?.name} from the project?`}
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

const RemoveTalentModal = ({ isOpen, talent = {}, onCancel, onConfirm }) => {
  const handleRemoveTalent = () => {
    removeTalent(talent.allocationId)
      .then(() => {
        toast.success("Talent Removed");
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
      title="Remove Talent"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
    >
      <RemoveBody talent={talent} onConfirm={handleRemoveTalent} onCancel={onCancel} />
    </MobileModal>
  ) : (
    <Modal
      size="sm"
      isOpen={isOpen}
      showCloseBtn={false}
      title="Remove talent"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
      isMobile={isMobile}
    >
      <RemoveBody talent={talent} onConfirm={handleRemoveTalent} onCancel={onCancel} />
    </Modal>
  );
};

export default RemoveTalentModal;
