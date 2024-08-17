import React from "react";

import { Text } from "../Typography";

const InfoRow = ({
  title,
  value = "",
  titleStyle,
  valueStyle,
  className = "",
  htmlValue = null,
}) => {
  return (
    <div
      className={`row pt-16 ${className} ${htmlValue ? "flex align-center" : undefined}`}
    >
      <div className={titleStyle}>
        <Text size="b2" fontWeight="semibold" className="color-CadetGrey">
          {title}
        </Text>
      </div>
      <div className={valueStyle}>
        {htmlValue || (
          <Text size="b1" fontWeight="medium">
            {value}
          </Text>
        )}
      </div>
    </div>
  );
};

export { InfoRow };
