import { Divider, Heading, InfoRow } from "@allocate-core/ui-components";
import React from "react";

import { isMobile } from "../../../common/common";
import styles from "./clientViewDetails.module.css";

const EmptyPocsState = [
  { name: "", email: "", phoneNumber: "" },
  { name: "", email: "", phoneNumber: "" },
];

const PointOfContactSection = ({ data }) => {
  let pocs = data;

  if (!data || !data.length) pocs = EmptyPocsState;
  if (pocs.length < 2) pocs = pocs.concat(EmptyPocsState[0]);

  return (
    <section className="row">
      {pocs?.map((p, index) => {
        return (
          <div key={index} className="col-xl-6">
            <Heading size="h6" className={`${styles.sectionTitle}`}>{`Point of Contact ${
              index + 1
            }`}</Heading>
            <InfoRow
              title={"Name"}
              titleStyle={"col-xl-4"}
              value={p.name || "--"}
              valueStyle={"col-xl-4"}
            />
            <InfoRow
              title={"Email"}
              titleStyle={"col-xl-4"}
              value={p.email || "--"}
              valueStyle={"col-xl-4"}
            />
            <InfoRow
              title={"Phone Number"}
              titleStyle={"col-xl-4"}
              value={p.phoneNumber || "--"}
              valueStyle={"col-xl-4"}
            />
            <InfoRow
              title={"Designation"}
              titleStyle={"col-xl-4"}
              value={p.designation || "--"}
              valueStyle={"col-xl-4"}
            />
            {isMobile && index !== 1 ? <Divider /> : <></>}
          </div>
        );
      })}
    </section>
  );
};

export default PointOfContactSection;
