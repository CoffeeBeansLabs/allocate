import { Heading, InfoRow } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React from "react";

import styles from "./clientViewDetails.module.css";

const AccountManager = ({ data }) => {
  const { fullNameWithExpBand = "N/A" } = data || {};
  return (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Account Manager
      </Heading>
      <InfoRow
        title={"Name"}
        titleStyle={"col-xl-2"}
        value={fullNameWithExpBand}
        valueStyle={"col-xl-4"}
      />
    </section>
  );
};

AccountManager.propTypes = {
  data: PropTypes.shape({
    fullNameWithExpBand: PropTypes.string,
  }),
};

export default AccountManager;
