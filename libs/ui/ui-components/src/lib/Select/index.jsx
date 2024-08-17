import { useHandleClickOutside } from "@allocate-core/util-hooks";
import PropTypes from "prop-types";
import React, { forwardRef, useRef, useState } from "react";

import ChevronIcon from "../../assets/chevron.svg";
import { Text } from "../Typography";
import styles from "./select.module.css";

const Select = forwardRef(
  (
    {
      icon,
      label,
      options,
      value = 1,
      onChange,
      placeholder,
      renderOption,
      onOutsideClick,
      isDisabled,
      field,
    },
    ref,
  ) => {
    const [open, toggleSelect] = useState(false);

    const selectRef = useRef(null);

    useHandleClickOutside({
      onOutSideClick: () => {
        if (typeof onOutsideClick === "function") {
          onOutsideClick();
        } else {
          toggleSelect(false);
        }
      },
      wrapperRef: ref || selectRef,
    });

    return (
      <div ref={ref || selectRef} className={styles.selectContainerWrapper} {...field}>
        {label ? <label className={styles.selectLabel}>{label}</label> : null}
        <div className={`${styles.selectContainer} ${isDisabled ? styles.disabled : ""}`}>
          <button
            type="button"
            className={styles.selectTitle}
            onClick={(e) => {
              !isDisabled ? toggleSelect((isExpanded) => !isExpanded) : null;
              e.stopPropagation();
            }}
          >
            {icon ? <img src={icon} alt="filter icon" /> : null}
            <Text as="div" size="b2">
              {value.label || placeholder}
            </Text>
            <img
              src={ChevronIcon}
              alt="Chevron"
              className={`ml-auto ${open ? styles.rotate180deg : ""}`}
            />
          </button>
          <div className={`${styles.optionsContainer} ${open ? "show" : "hide"}`}>
            {options.map((option) => {
              if (typeof renderOption === "function") {
                return renderOption(option);
              }
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`${styles.option} ${
                    value.value === option.value ? styles.selected : ""
                  }`}
                  onClick={(e) => {
                    if (value !== option.value) {
                      onChange(option, e);
                      toggleSelect(false);
                    }
                  }}
                >
                  <Text size="b1">{option.label}</Text>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

Select.defaultProps = {
  label: null,
  icon: null,
  isDisabled: false,
  onChange: () => {},
  value: {},
  onOutsideClick: null,
  options: [],
};

Select.propTypes = {
  label: PropTypes.string || PropTypes.object,
  icon: PropTypes.string,
  value: PropTypes.object,
  placeholder: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
  onChange: PropTypes.func.isRequired,
  onOutsideClick: PropTypes.func,
  isDisabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    }),
  ),
};

export { Select };
