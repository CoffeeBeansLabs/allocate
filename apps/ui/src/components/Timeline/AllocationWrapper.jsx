import { View } from "@allocate-core/ui-components";
import React from "react";

import styles from "./timeline.module.css";

const AllocationWrapper = ({ style, children }) => (
  <View className={styles.timelineRowWrapper} style={style}>
    {children}
  </View>
);

export default AllocationWrapper;
