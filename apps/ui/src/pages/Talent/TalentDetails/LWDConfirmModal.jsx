import { Button, Modal, Text } from "@allocate-core/ui-components";
import React from "react";

import { isMobile } from "../../../common/common";
import MobileModal from "../../../components/MobileModal/MobileModal";

const ModalBody = ({ onCancel, onConfirm }) => {
  return (
    <React.Fragment>
      <Text size="b1" fontWeight="medium">
        Warning! The LWD cannot be changed once the employee status is changed to Closed.
        Are you sure you want to continue?
      </Text>
      <div className="flex gap-20 mt-16">
        <Button variant="secondary" onClick={onCancel} className="ml-auto">
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes
        </Button>
      </div>
    </React.Fragment>
  );
};

const LWDConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  return isMobile ? (
    <MobileModal
      size="sm"
      isOpen={isOpen}
      showCloseBtn={false}
      isFullScreen={false}
      showTitle={true}
      title="Are you sure?"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
    >
      <ModalBody onConfirm={onConfirm} onCancel={onCancel} />
    </MobileModal>
  ) : (
    <Modal
      size="sm"
      isOpen={isOpen}
      showCloseBtn={false}
      title="Are you sure?"
      onClose={onCancel}
      preventCloseOnOutsideClick={true}
      isMobile={isMobile}
    >
      <ModalBody onConfirm={onConfirm} onCancel={onCancel} />
    </Modal>
  );
};

export default LWDConfirmModal;
