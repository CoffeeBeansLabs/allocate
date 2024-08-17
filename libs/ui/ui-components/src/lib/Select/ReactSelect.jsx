import "./customSelect.css";

import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";

import { DropdownIndicator } from "./DropdownIndicator";

const ReactSelect = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  isError,
  components,
  ...reactSelectrops
}) => {
  return (
    <div className={`customSelectWrapper ${isError ? "invalid" : ""}`}>
      {label ? <span className="selectLabel">{label}</span> : null}
      <Select // the order of props is important
        options={options}
        placeholder={placeholder}
        classNamePrefix="customSelect"
        className="customSelectContainer"
        components={{ DropdownIndicator, ...components }}
        {...reactSelectrops}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

ReactSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.object.isRequired,
      ]),
      value: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.number.isRequired,
      ]),
    }),
  ),
};

export { ReactSelect };
