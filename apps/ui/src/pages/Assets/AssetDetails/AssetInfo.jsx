import { InfoRow, Text } from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import React from "react";
import { useNavigate } from "react-router-dom";

import NavigateIcon from "/icons/navigateIcon.svg";

import { isMobile } from "../../../common/common";
import styles from "./assetDetails.module.css";

const AssetInfo = ({ data = {} }) => {
  const navigate = useNavigate();
  return (
    <div className="row">
      <div className="col-xl-6">
        <InfoRow
          title="CB Asset ID"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.cbAssetId || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Serial Number"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.serialNum || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Type"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.type || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Model"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.model || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Brand"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.brand || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Color"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.colour || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Year"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.year || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Screen Size"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.screensize || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="RAM"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={`${data?.ram}GB` || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Screenshot"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
          htmlValue={
            data?.screenshot && (
              <img
                src={`data:image/jpeg;base64, ${data?.screenshot}`}
                alt="screenshot with serial number"
                className={styles.icons}
              />
            )
          }
        />
        <InfoRow
          title="Status"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
          htmlValue={
            <div className={styles.statusValue}>
              <Text size="b2" fontWeight="bold">
                {data?.active ? "Active" : data?.closed ? "Closed" : "NA"}
              </Text>
            </div>
          }
        />

        <InfoRow
          title="Sub status"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
          htmlValue={
            <div className={styles.statusValue}>
              <Text size="b2" fontWeight="bold">
                {data?.active || data?.closed || "NA"}
              </Text>
            </div>
          }
        />
        <InfoRow
          title="Ownership Type"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.ownership || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Leasing company"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.leasingCompany || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Lease Start Date"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.leaseStartDate || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Comments"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.comments || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Other Assets"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.otherAssets || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
      </div>
      <div className="col-xl-6">
        <InfoRow
          title="Assigned to"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
          htmlValue={
            <div className="flex align-center gap-10">
              <InfoRow value={data?.taggedTo || "NA"} valueStyle="col" className="py-0" />
              <img
                src={NavigateIcon}
                alt="navigate to profile button"
                className={styles.icons}
                role="presentation"
                onClick={() => navigate(`/people/details/${data?.userId}`)}
              />
            </div>
          }
        />
        <InfoRow
          title="Project"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.project || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Client"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.client || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Employee ID"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.employeeId || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Date of assignment"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={getFormatedDate(data?.dateOfChange) || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Invoice Number"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
          htmlValue={
            <div className="flex align-center gap-10">
              <InfoRow
                value={data?.invoiceNum || "NA"}
                valueStyle="col"
                className="py-0"
              />
              {data?.linkToInvoice ? (
                <a href={data?.linkToInvoice} target="_blank" rel="noreferrer">
                  <img
                    src={NavigateIcon}
                    alt="navigate to invoice link"
                    className={styles.icons}
                    role="presentation"
                  />
                </a>
              ) : (
                ""
              )}
            </div>
          }
        />
        <InfoRow
          title="Date of purchase"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={getFormatedDate(data?.dateOfPurchase) || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Amount"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.amount || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="GST"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.gst || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Total Amount Paid"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.totalAmtPaid || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Vendor"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.vendor || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Warranty Period"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.warranty || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Location"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.location || "NA"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
        <InfoRow
          title="Jumpcloud Integration"
          titleStyle={isMobile ? "col" : "col-xl-5"}
          value={data?.isJumpCloudIntegration === true ? "Yes" : "No"}
          valueStyle={isMobile ? "col" : "col-xl-7"}
          className={styles.detailRow}
        />
      </div>
    </div>
  );
};

export default AssetInfo;
