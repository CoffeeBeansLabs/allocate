import { Heading, InfoRow } from "@allocate-core/ui-components";
import React from "react";

import styles from "./clientViewDetails.module.css";

const AccountManager = ({ data }) => {
  return (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Account Manager
      </Heading>
      <InfoRow
        title={"Name"}
        titleStyle={"col-xl-2"}
        value={data?.fullName}
        valueStyle={"col-xl-4"}
      />
    </section>
  );
};

export default AccountManager;
