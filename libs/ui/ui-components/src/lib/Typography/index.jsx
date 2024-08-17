import PropTypes from "prop-types";
import React from "react";

import styles from "./typography.module.css";

const Heading = React.memo(({ as, size, fontWeight, children, ...props }) => {
  return React.createElement(
    as,
    {
      ...props,
      className: `${styles[size]} ${styles[fontWeight]} ${props.className} `,
    },
    children,
  );
});

const Text = React.memo(({ as, size, fontWeight, children, ...props }) => {
  return React.createElement(
    as,
    {
      ...props,
      className: `${styles[size]} ${styles[fontWeight]} ${props.className}`,
    },
    children,
  );
});

Heading.displayName = "Heading";

Heading.propTypes = {
  as: PropTypes.oneOf(["h1", "h2", "h3", "h4", "h5", "h6"]),
  size: PropTypes.oneOf(["h1", "h2", "h3", "h4", "h5", "h6"]),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
  className: PropTypes.string,
  fontWeight: PropTypes.oneOf(["light", "regular", "medium", "semibold", "bold"]),
};

Heading.defaultProps = {
  as: "h6",
  size: "h6",
  children: "",
  className: "",
  fontWeight: "regular",
};

Text.displayName = "Text";

Text.propTypes = {
  as: PropTypes.string,
  size: PropTypes.oneOf(["b1", "b2", "b3", "b4"]),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
  className: PropTypes.string,
  fontWeight: PropTypes.oneOf(["light", "regular", "medium", "semibold", "bold"]),
};

Text.defaultProps = {
  as: "span",
  size: "b1",
  children: "",
  className: "",
  fontWeight: "regular",
};

export { Heading, Text };
