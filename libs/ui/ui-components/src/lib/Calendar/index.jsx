import "react-multi-date-picker/styles/colors/red.css";
import "react-multi-date-picker/styles/layouts/mobile.css";

import React from "react";
import DatePicker from "react-multi-date-picker";

import CalendarIcon from "../../assets/calendarIcon.svg";
import CloseIcon from "../../assets/closeIconBlack.svg";
import styles from "./calendar.module.css";

const Calendar = ({
  value,
  placeholder,
  numberOfMonths,
  onChange,
  showCloseBtn,
  onClear,
  isMobile,
  ...props
}) => {
  return (
    <div className="relative">
      <img
        src={CalendarIcon}
        className={`${styles.calendarIcon} flex-center`}
        alt="Calendar icon"
      />
      <DatePicker
        className={`red ${isMobile && "rmdp-mobile"}`}
        containerClassName={styles.customContainer}
        inputClass={styles.customInput}
        calendarPosition="bottom-center"
        arrow={false}
        numberOfMonths={numberOfMonths}
        placeholder={placeholder}
        value={value}
        format="MMMM DD, YYYY"
        onChange={onChange}
        editable="true"
        {...props}
      />
      <button
        type="button"
        className={`${styles.closeBtn} flex-center ${
          showCloseBtn && !!value ? "" : "hide"
        }`}
        onClick={onClear}
      >
        <img src={CloseIcon} alt="Click to close calendar" />
      </button>
    </div>
  );
};

export { Calendar };
