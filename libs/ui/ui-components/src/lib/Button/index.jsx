import PropTypes from "prop-types";
import React, { forwardRef } from "react";

import styles from "./button.module.css";

const Button = React.memo(
  forwardRef(({ variant, className, children, size, color, ...btnProps }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.btn} ${styles[variant]} ${className} ${styles[size]} ${styles[color]}`}
        {...btnProps}
      >
        {children}
      </button>
    );
  }),
);

Button.displayName = "Button";

Button.defaultProps = {
  size: "md",
  className: "",
  variant: "plain",
};

Button.propTypes = {
  btnProps: PropTypes.object || null,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.oneOf(["red", "green"]),
  variant: PropTypes.oneOf(["primary", "secondary", "tertiary", "plain"]),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
};

export { Button };
