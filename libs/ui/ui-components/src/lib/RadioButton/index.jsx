import React, { useState } from "react";

import { Text } from "../Typography";
import styles from "./radioButton.module.css";

const RadioButton = ({
  error,
  label,
  options = [],
  value,
  onChange = () => {},
  mandatoryField = true,
}) => {
  const [checkedValue, setCheckedValue] = useState(value);
  return (
    <div>
      <Text size="b2" fontWeight="medium" className={styles.label}>
        {label}
      </Text>
      <div className="flex gap-40">
        {options?.map((option) => (
          <div key={option?.value} className="flex gap-10 align-center">
            <input
              type="radio"
              checked={option?.value === checkedValue?.value}
              onChange={() => {
                setCheckedValue(option);
                onChange(option);
              }}
              value={option.value}
              className={
                option?.value === checkedValue?.value ? styles.radioChecked : styles.radio
              }
            />
            {option?.label}
          </div>
        ))}
      </div>

      {mandatoryField ? (
        <Text size="b2" className={`errorMessage ${error ? "" : "hide"}`}>
          {error ?? ""}
        </Text>
      ) : null}
    </div>
  );
};

export { RadioButton };
