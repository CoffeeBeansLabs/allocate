import React, { forwardRef } from "react";

import { Calendar } from "../Calendar";
import styles from "./input.module.css";

const Input = forwardRef(({ label, className = "", variant, ...props }, ref) => {
  return (
    <div className={styles.inputContainer}>
      <label className={`${label ? "show" : "hide"} ${styles.inputLabel}`}>{label}</label>
      {variant === "date" ? (
        <Calendar
          numberOfMonths={1}
          format="MMM DD, YYYY"
          fixMainPosition={true}
          {...props}
        />
      ) : variant === "textarea" ? (
        <textarea
          ref={ref}
          className={`${styles.inputField} ${styles.textareaField} ${className}`}
          {...props}
        />
      ) : (
        <input ref={ref} className={`${styles.inputField} ${className}`} {...props} />
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
