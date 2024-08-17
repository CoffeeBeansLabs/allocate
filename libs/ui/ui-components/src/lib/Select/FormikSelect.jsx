import { useHandleClickOutside } from "@allocate-core/util-hooks";
import classNames from "classnames/bind";
import { useField } from "formik";
import PropTypes from "prop-types";
import React, { forwardRef, useRef, useState } from "react";

import ChevronIcon from "../../assets/chevron.svg";
import { Text } from "../Typography";
import styles from "./select.module.css";

const cx = classNames.bind(styles);

const SelectField = forwardRef(({ name, label, ...props }, ref) => {
  const [open, toggleSelect] = useState(false);

  const [field, meta] = useField(name);

  const isError = meta.touched && meta.error;
  const errorMessage = meta.error;

  const {
    icon,
    options,
    onChange,
    placeholder,
    renderOption,
    onOutsideClick,
    isDisabled,
  } = props;

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
    <div ref={ref || selectRef} className={styles.selectContainerWrapper}>
      {label ? <label className={styles.selectLabel}>{label}</label> : null}
      <div
        className={cx(styles.selectContainer, {
          invalid: isError,
          disabled: isDisabled,
        })}
      >
        <button
          type="button"
          className={styles.selectTitle}
          onClick={() => {
            !isDisabled ? toggleSelect((isExpanded) => !isExpanded) : null;
          }}
        >
          {icon ? <img src={icon} alt="filter icon" /> : null}
          <Text as="div" size="b2">
            {field?.value?.label || placeholder}
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
                  field?.value?.value === option.value ? styles.selected : ""
                }`}
                onClick={() => {
                  if (field?.value?.value !== option.value) {
                    onChange(name, option);
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
      <Text as="div" size="b2" className={cx({ errorMessage: isError, hide: !isError })}>
        {errorMessage}
      </Text>
    </div>
  );
});

SelectField.displayName = "SelectField";

SelectField.defaultProps = {
  label: null,
  icon: null,
  isDisabled: false,
  onChange: () => {},
  value: {},
  onOutsideClick: null,
  options: [
    {
      value: "option1",
      label: "Option 1",
    },
    {
      value: "option2",
      label: "Option 2",
    },
  ],
};

SelectField.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  value: PropTypes.object,
  placeholder: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
  onChange: PropTypes.func.isRequired,
  onOutsideClick: PropTypes.func,
  isDisabled: PropTypes.bool,
};

export { SelectField };
