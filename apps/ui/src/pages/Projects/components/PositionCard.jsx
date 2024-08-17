import { Button, Text } from "@allocate-core/ui-components";
import React from "react";

import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import styles from "./components.module.css";
import PositionCriteria from "./PositionCriteria";

const PositionCard = ({ criteria, positionName, onManageClick }) => {
  return (
    <div className={`relative ${!isMobile && styles.skillsCardTrigger}`}>
      <Text as="div" size="b2" fontWeight="medium">
        {positionName}
      </Text>
      <div className={`hidden-sm-down card-1 ${styles.skillsCard}`}>
        <PositionCriteria criteria={criteria} />
        <div className={styles.positionCardCTA}>
          <PermissionGate
            scopes={[SCOPES.canUpdate]}
            showPermittedElement
            permittedElement={(hasPermission) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={onManageClick}
                disabled={!hasPermission}
              >
                Manage Talent
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(PositionCard);
