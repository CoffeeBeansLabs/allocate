import { Text, View } from "@allocate-core/ui-components";
import {
  getAssetTimelineValues,
  getStatus,
  transformTimelineData,
} from "@allocate-core/util-data-values";
import { getFormatedDate } from "@allocate-core/util-formatting";
import React from "react";

import { isMobile } from "../../../common/common";
import styles from "./assetDetails.module.css";

const AssetTimeline = ({ timelineData }) => {
  if (!timelineData) return;

  const rows = transformTimelineData(timelineData || [])?.map((allocation) => {
    const status = getStatus(allocation);
    const { widthValue, backgroundValue, statusValue } = getAssetTimelineValues(
      allocation?.startDate,
      allocation?.endDate,
      status,
      isMobile,
    );

    return (
      <div
        className={styles.timelineBar}
        style={{ width: isMobile ? widthValue : null }}
        key={`${allocation.changeId}`}
      >
        <div className="flex">
          <Text size="b2" fontWeight="semibold" className="color-CadetGrey">
            {getFormatedDate(allocation.startDate)}
          </Text>
          <Text size="b2" fontWeight="semibold" className="ml-auto color-CadetGrey">
            {allocation.endDate ? getFormatedDate(allocation.endDate) : "Present"}
          </Text>
        </div>
        <View
          className="relative"
          style={{
            background: backgroundValue,
            borderRadius: 3,
            height: "12px",
            width: isMobile ? "100%" : widthValue,
            zIndex: 2,
          }}
        ></View>
        <Text size="b2" fontWeight="medium">
          {allocation?.to?.empName || statusValue}
        </Text>
      </div>
    );
  });

  return <div className={styles.timeline}>{rows}</div>;
};

export default AssetTimeline;
