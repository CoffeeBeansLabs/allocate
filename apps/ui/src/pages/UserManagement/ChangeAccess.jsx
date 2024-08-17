import { Button, Text } from "@allocate-core/ui-components";
import React from "react";
import { toast } from "react-toastify";

import { updateUserGroup } from "../../api/userManagement";

const ChangeAccess = ({ userChangeValue = {}, onCancel, onChange }) => {
  const handleChangeRole = () => {
    updateUserGroup([
      {
        groupId: userChangeValue.role.value,
        userId: userChangeValue.user.id,
      },
    ])
      .then(() => {
        toast.success("User Role Updated");
        onChange();
      })
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail);
        onCancel();
      });
  };

  return (
    <div>
      <Text size="b1" fontWeight="medium">
        Are you sure you want to change access of {userChangeValue.user.userName} to{" "}
        {userChangeValue.role.label}?
      </Text>
      <div className="flex gap-10 mt-16 pt-20">
        <Button variant="secondary" className="ml-auto" onClick={onCancel}>
          <Text size="b2" fontWeight="medium">
            Not Yet
          </Text>
        </Button>
        <Button variant="primary" onClick={handleChangeRole}>
          <Text size="b2" fontWeight="medium">
            Yes, Change
          </Text>
        </Button>
      </div>
    </div>
  );
};

export default ChangeAccess;
