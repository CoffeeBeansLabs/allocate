import classNames from "classnames/bind";
import { useField } from "formik";
import React, { forwardRef } from "react";

import { Calendar } from "../Calendar";
import { Text } from "../Typography";
import styles from "./input.module.css";

const cx = classNames.bind(styles);

const FormikInput = forwardRef(
  ({ name, label, className = "", variant, onChange, ...props }, ref) => {
    const [field, meta, helpers] = useField(name);

    const isError = meta.touched && meta.error;
    const errorMessage = meta.error;

    const handleChange = (value) => {
      helpers.setValue(value);
      if (onChange) {
        onChange(value);
      }
    };

    return (
      <div className={cx([styles.inputContainer, { invalid: isError }])}>
        <label className={cx([styles.inputLabel, { [styles.errorMessage]: isError }])}>
          {label}
        </label>
        {variant === "date" ? (
          <Calendar
            ref={ref}
            numberOfMonths={1}
            format="MMM DD, YYYY"
            fixMainPosition={true}
            value={field.value}
            onChange={handleChange}
            {...props}
          />
        ) : variant === "textarea" ? (
          <textarea
            ref={ref}
            className={cx([styles.inputField, styles.textareaField, className])}
            value={field.value}
            onChange={(e) => handleChange(e.target.value)}
            {...props}
          />
        ) : variant === "percent" ? (
          <input
            ref={ref}
            className={cx([styles.inputField, styles.inputFieldWithPercent, className])}
            value={field.value}
            onChange={(e) => handleChange(e.target.value)}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            className={cx([styles.inputField, className])}
            value={field.value}
            onChange={(e) => handleChange(e.target.value)}
            {...props}
          />
        )}

        <Text size="b2" className={cx({ errorMessage: isError, hide: !isError })}>
          {errorMessage}
        </Text>
      </div>
    );
  },
);

FormikInput.displayName = "FormikInput";

export { FormikInput };
