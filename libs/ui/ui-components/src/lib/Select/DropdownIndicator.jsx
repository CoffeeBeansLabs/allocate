import React from "react";
import { components } from "react-select";

import ChevronIcon from "../../assets/chevron.svg";

const DropdownIndicator = ({ ...props }) => (
  <components.DropdownIndicator {...props}>
    <img
      src={ChevronIcon}
      alt="Click to toggle dropdown menu"
      className={`customSelect__chevronIcon ${
        props?.selectProps?.menuIsOpen && "menuOpen"
      }`}
    />
  </components.DropdownIndicator>
);

export { DropdownIndicator };
