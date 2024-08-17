import {
  Button,
  Heading,
  Input,
  ReactSelect,
  Select,
} from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import FilterIcon from "/icons/filter.svg";

import styles from "./MobileFilterComponent.module.css";

const MobileFilterComponent = ({
  initialState = {},
  dropdown,
  sortDropdown,
  handleApplyFilter = () => {},
}) => {
  const [startDate, setStartDate] = useState(initialState.dates?.[0]);
  const [errorMessage, setErrorMessage] = useState("");
  const [endDate, setEndDate] = useState(initialState.dates?.[1]);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState(initialState.status);
  const [sortBy, setSortBy] = useState(initialState.sort);

  const validateDateInterval = (startDate, endDate) => {
    if (!startDate && !endDate) {
      setError(false);
    } else if (!startDate) {
      setErrorMessage("'From' date cannot be blank");
      setError(true);
    } else if (!endDate) {
      setErrorMessage("'To' date cannot be blank");
      setError(true);
    } else if (endDate < startDate) {
      setErrorMessage("'To' date must be after the 'From' date");
      setError(true);
    } else {
      setError(false);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    validateDateInterval(startDate, endDate);
  }, [startDate, endDate]);

  const showErrorMessage = <div className={styles.errorMessage}>{errorMessage}</div>;

  return (
    <div className={styles.searchModal}>
      <div className="col-xl-2 ml-auto">
        <Select
          icon={FilterIcon}
          placeholder="Select Filter"
          value={statusFilter}
          options={dropdown}
          onChange={setStatusFilter}
        />
      </div>
      <Heading size={"h5"} fontWeight={"medium"} className={styles.heading}>
        Search Date Range
      </Heading>
      <div className={styles.dateContainer}>
        <div className="col">
          <Input
            required
            label="From"
            placeholder="Select Date"
            value={startDate}
            variant="date"
            onChange={(date) => {
              setStartDate(date);
            }}
            showCloseBtn
            onClear={() => setStartDate(null)}
          />
        </div>
        <div className="col">
          <Input
            required
            label="To"
            placeholder="Select Date"
            value={endDate}
            variant="date"
            onChange={(date) => {
              setEndDate(date);
            }}
            showCloseBtn
            onClear={() => setEndDate(null)}
          />
        </div>
      </div>
      {sortDropdown.length > 0 && (
        <>
          <Heading size={"h5"} fontWeight={"medium"} className={styles.heading}>
            Sort By
          </Heading>
          <div className={styles.sortingContainer}>
            <ReactSelect
              label="Sort By"
              placeholder="Sort By"
              value={sortBy}
              options={sortDropdown}
              onChange={setSortBy}
              isClearable={true}
              menuPlacement="auto"
            />
          </div>
        </>
      )}
      {error && showErrorMessage}
      <Button
        variant="primary"
        onClick={() => {
          !error && handleApplyFilter(statusFilter, [startDate, endDate], sortBy);
        }}
      >
        Apply Filter
      </Button>
    </div>
  );
};

MobileFilterComponent.defaultProps = {
  initialState: {},
  dropdown: [],
  sortDropdown: [],
  handleApplyFilter: () => {},
};

MobileFilterComponent.propTypes = {
  initialState: PropTypes.object,
  dropdown: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortDropdown: PropTypes.arrayOf(PropTypes.object),
  handleApplyFilter: PropTypes.func.isRequired,
};

export default MobileFilterComponent;
