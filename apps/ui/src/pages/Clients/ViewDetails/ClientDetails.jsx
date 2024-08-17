import { Heading, InfoRow } from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import React from "react";

import styles from "./clientViewDetails.module.css";

const ClientDetails = ({ data }) => {
  return (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Client Details
      </Heading>
      <InfoRow
        title={"Domain"}
        titleStyle="col-xl-2"
        value={data?.industry?.name || "--"}
        valueStyle="col-xl-3"
      />
      <InfoRow
        title={"City"}
        titleStyle="col-xl-2"
        value={data?.city || "--"}
        valueStyle="col-xl-3"
      />
      <InfoRow
        title={"Country"}
        titleStyle="col-xl-2"
        value={data?.country || "--"}
        valueStyle="col-xl-3"
      />
      <InfoRow
        title={"Start Date"}
        titleStyle="col-xl-2"
        value={getFormatedDate(data?.startDate) || "--"}
        valueStyle="col-xl-3"
      />
      <InfoRow
        title={"Remarks"}
        titleStyle="col-xl-2"
        value={data?.comment || "--"}
        valueStyle="col-xl-4"
      />
    </section>
  );
};

export default ClientDetails;
