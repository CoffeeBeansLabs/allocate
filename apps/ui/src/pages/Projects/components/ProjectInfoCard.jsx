import { Badge, Heading, Text } from "@allocate-core/ui-components";
import React from "react";

import styles from "./components.module.css";

const ProjectInfoCard = ({ name }) => {
  return (
    <div className={`relative ${styles.projectInfoCardCont}`}>
      <Heading as="h1" size="h4" fontWeight="bold">
        {name}
      </Heading>
      <div className={`card-1 ${styles.projectInfoCard}`}>
        <Badge type="green">Active</Badge>
        <div className={`${styles.pt14} row`}>
          <Text size="b2" fontWeight="regular" className="col-md-5">
            Start Date:
          </Text>
          <Text size="b2" fontWeight="semibold" className="col-md-6">
            January 24, 2023
          </Text>
        </div>
        <div className="pt-20 row">
          <Text size="b2" fontWeight="regular" className="col-md-6">
            End Date:
          </Text>
          <Text size="b2" fontWeight="semibold" className="col-md-6">
            -- --
          </Text>
        </div>
        <hr className={styles.hr} />
        <div className="pt-20 row">
          <Text size="b2" fontWeight="regular" className="col-md-6">
            Total Positions:
          </Text>
          <Text size="b2" fontWeight="semibold" className="col-md-6">
            25
          </Text>
        </div>
        <div className={`${styles.pt14} row`}>
          <Text size="b2" fontWeight="regular" className="col-md-6">
            Closed:
          </Text>
          <Text size="b2" fontWeight="semibold" className="col-md-6">
            15
          </Text>
        </div>
        <div className={`${styles.pt14} row`}>
          <Text size="b2" fontWeight="regular" className="col-md-6">
            Open:
          </Text>
          <Text size="b2" fontWeight="semibold" className="col-md-6">
            10
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoCard;
