import PropTypes from "prop-types";
import React from "react";

import CloseIcon from "../../assets/closeIconBlack.svg";
import SearchIcon from "../../assets/search.svg";
import styles from "./searchInput.module.css";

const SearchInput = ({
  className,
  placeholder,
  showCloseBtn,
  onClear,
  ...inputProps
}) => {
  return (
    <div key="2022" className="relative">
      <img src={SearchIcon} alt="Search icon" className={styles.searchIcon} />
      <input
        placeholder={placeholder}
        className={`${styles.searchInput} ${className}`}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onClear}
        className={`${styles.closeBtn} ${
          showCloseBtn && !!inputProps.value ? "" : "hide"
        }`}
      >
        <img src={CloseIcon} alt="Clear Search Text" />
      </button>
    </div>
  );
};

SearchInput.defaultProps = {
  className: "",
  placeholder: "",
  onClear: () => {},
  showCloseBtn: false,
};

SearchInput.propTypes = {
  onClear: PropTypes.func,
  className: PropTypes.string,
  showCloseBtn: PropTypes.bool,
  placeholder: PropTypes.string,
};

export { SearchInput };
