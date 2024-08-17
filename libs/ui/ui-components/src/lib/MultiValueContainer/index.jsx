import PropTypes from "prop-types";
import React, { useState } from "react";

import CrossBtnIcon from "../../assets/crossBtnIcon.svg";
import { Input } from "../Input";
import { ReactSelect } from "../Select/ReactSelect";
import { Text } from "../Typography";
import styles from "./multiValueContainer.module.css";

const MultiValueContainer = ({ values = [], options = [], variant, onDelete, onAdd }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState(null);

  const handleAddValue = (e, option = {}) => {
    if (e.key === "Enter" && variant === "input") {
      onAdd(inputValue);
      setInputValue("");
    } else if (variant === "select") {
      onAdd(option);
      setSelectValue(null);
    }
  };

  return (
    <div className={styles.container}>
      {variant === "input" ? (
        <Input
          value={inputValue}
          placeholder="Enter"
          onKeyDown={handleAddValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        <ReactSelect
          placeholder="Start typing..."
          value={selectValue}
          options={options}
          onChange={(option, e) => {
            setSelectValue(option);
            handleAddValue(e, option);
          }}
        />
      )}
      <div className={`row ${styles.valuesContainer}`}>
        {values.map((item) => {
          return (
            <div
              key={item.value}
              className={`${styles.valueItem} flex align-center gap-10`}
            >
              <Text size="b2" fontWeight="bold">
                {item.label}
              </Text>
              <img
                src={CrossBtnIcon}
                alt="Cross button to remove"
                className={styles.crossIcon}
                role="presentation"
                onClick={() => onDelete(item.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

MultiValueContainer.propTypes = {
  label: PropTypes.string,
  variant: PropTypes.oneOf(["input", "select"]).isRequired,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
      ]),
    }),
  ),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
      ]),
    }),
  ),
  onDelete: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export { MultiValueContainer };
