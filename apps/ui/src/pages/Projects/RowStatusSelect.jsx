import { Select, Text } from "@allocate-core/ui-components";
import React, { useState } from "react";
import { toast } from "react-toastify";

import { updateProjectStatus } from "../../api/projects";
import PermissionGate, { getPermission } from "../../components/PermissionGate";
import { SCOPES } from "../../constants/roles";
import StatusIcons from "../../constants/status";
import styles from "./projects.module.css";

export const accountManagerConstraint = (status) => {
  const canPartiallyUpdateProjectStatus = getPermission([
    SCOPES.canPartiallyUpdateProjectStatus,
  ]);

  return (
    status &&
    canPartiallyUpdateProjectStatus &&
    (status.includes("SIGNED") || status.includes("ACTIVE") || status.includes("CLOSED"))
  );
};

const RowStatusSelect = ({ value, projectId }) => {
  const projectStatus = StatusIcons?.find((status) => status.type === value);

  const [statusValue, setStatusValue] = useState({
    value: projectStatus?.type,
    label: (
      <div className="flex-center gap-30">
        <img
          src={projectStatus?.icon}
          alt="project status icon"
          aria-hidden="true"
          className={styles.iconImage}
        />
        <Text size="b2">{projectStatus?.uiString}</Text>
      </div>
    ),
  });

  const statusOptions = StatusIcons.reduce((options, status) => {
    if (!accountManagerConstraint(status.type)) {
      options.push({
        value: status.type,
        label: (
          <div className={`flex align-center ${styles.customLabel}`}>
            <img alt="status icon" src={status.icon} className={styles.iconImage} />
            <Text size="b2">{status.uiString}</Text>
          </div>
        ),
      });
    }
    return options;
  }, []);

  return (
    <PermissionGate
      scopes={[SCOPES.canUpdateProjectStatus, SCOPES.canPartiallyUpdateProjectStatus]}
      showPermittedElement
      permittedElement={(hasPermission) => (
        <Select
          placeholder="Status"
          value={statusValue}
          options={statusOptions}
          onChange={(option, e) => {
            e.stopPropagation();

            updateProjectStatus(projectId, {
              status: option.value,
            })
              .then(() => {
                toast.success("Status updated");
                setStatusValue(option);
              })
              .catch((errorResponse) => {
                toast.error(errorResponse?.data.detail);
              });
          }}
          isDisabled={accountManagerConstraint(statusValue.value) || !hasPermission}
        />
      )}
    />
  );
};

export default RowStatusSelect;
