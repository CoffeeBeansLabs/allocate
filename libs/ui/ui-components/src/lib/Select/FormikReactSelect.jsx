import "./customSelect.css";

import { useField } from "formik";
import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";

import { Text } from "../Typography";
import { DropdownIndicator } from "./DropdownIndicator";

const FormikReactSelect = ({
  name,
  label,
  options,
  placeholder,
  onChange,
  value,
  components,
  onInputChange,
  isLoadingInput,
  isClearable = false,
  ...reactSelectrops
}) => {
  const [fieldProps, meta, field] = useField(name);

  const isError = meta?.touched && meta?.error;

  const handleInput = (inputValue) => {
    if (onInputChange) {
      onInputChange(inputValue, name);
    }
  };

  return (
    <div className={`customSelectWrapper ${isError ? "invalid" : ""}`}>
      {label ? <span className="selectLabel">{label}</span> : null}
      <Select // the order of props is important
        options={options}
        placeholder={placeholder}
        classNamePrefix="customSelect"
        className="customSelectContainer"
        components={{ DropdownIndicator, ...components }}
        {...fieldProps}
        {...reactSelectrops}
        onChange={onChange || field?.setValue}
        value={value || fieldProps?.value}
        onInputChange={handleInput}
        isLoading={isLoadingInput}
        isClearable={isClearable}
      />
      {isError && (
        <Text size="b2" className="errorMessage">
          {meta.error}
        </Text>
      )}
    </div>
  );
};

FormikReactSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
      ]),
    }),
  ),
  onInputChange: PropTypes.func,
  isLoadingInput: PropTypes.bool,
};

export { FormikReactSelect };
