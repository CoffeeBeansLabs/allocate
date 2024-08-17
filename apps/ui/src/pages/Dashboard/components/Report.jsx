import "react-multi-date-picker/styles/colors/red.css";

import { Button, CheckboxOption, ReactSelect, Text } from "@allocate-core/ui-components";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import React, { useRef, useState } from "react";
import { Calendar } from "react-multi-date-picker";
import { toast } from "react-toastify";

import ReportIcon from "/icons/reportIcon.svg";

import locationOptions from "../../../constants/locationOptions";
import styles from "./components.module.css";

const Report = ({
  dataFunction,
  filename = "filename",
  showLocation = false,
  showDateRange = false,
  datesRequired = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateValues, setDateValues] = useState([]);
  const [locationValue, setLocationValue] = useState(null);
  const dropdownRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => setIsDropdownOpen(false),
    wrapperRef: dropdownRef,
  });

  const handleShowReportClick = () => {
    if (!isDropdownOpen) {
      setDateValues([]);
      setLocationValue(null);
    }
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleDownloadClick = () => {
    if (!isDropdownOpen) return;

    setIsLoading(true);
    dataFunction({
      startDate: showLocation ? null : dateValues[0]?.format("YYYY-MM-DD") || "",
      endDate: showLocation ? null : dateValues[1]?.format("YYYY-MM-DD") || "",
      location: showLocation
        ? locationValue?.map((location) => location?.value).join(",")
        : null,
    })
      .then(downloadCSV)
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  const downloadCSV = (dataInCSV) => {
    const reportFilenameFormat = `${filename}${
      showLocation
        ? `_${locationValue?.map((location) => location?.value).join("_")}`
        : ""
    }${
      dateValues?.length
        ? `_${dateValues[0]?.format("YYYY-MM-DD") || ""}_${
            dateValues[1]?.format("YYYY-MM-DD") || ""
          }`
        : ""
    }.csv`;

    var blob = new Blob(["\ufeff", dataInCSV]);
    var url = URL.createObjectURL(blob);

    const element = document.createElement("a");
    element.href = url;
    element.download = reportFilenameFormat;

    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className={styles.report} ref={dropdownRef}>
      <img
        src={ReportIcon}
        alt="show report icon"
        role="presentation"
        className={styles.reportIcon}
        onClick={handleShowReportClick}
      />

      {isDropdownOpen && (
        <div
          className={`flex-col align-center justify-center gap-20 ${styles.reportDropdown} card-1`}
        >
          {showLocation && (
            <div className="col-xl-8 pt-20">
              <ReactSelect
                placeholder="Select location"
                value={locationValue}
                onChange={setLocationValue}
                options={locationOptions}
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  Option: CheckboxOption,
                }}
              />
            </div>
          )}
          {showDateRange && (
            <Calendar
              className="red"
              value={dateValues}
              onChange={(value) => setDateValues(value)}
              range
            />
          )}
          <Text size="b1" fontWeight="medium" className={isLoading ? "show" : "hide"}>
            Loading...
          </Text>

          <Button
            variant="secondary"
            disabled={
              (datesRequired && dateValues?.length < 2) ||
              (showLocation && !locationValue) ||
              isLoading
            }
            onClick={handleDownloadClick}
          >
            Download CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default Report;
