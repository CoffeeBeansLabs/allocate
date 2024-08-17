import React from "react";

const View = React.memo(({ hide, children, ...props }) => {
  return hide ? null : <div {...props}>{children}</div>;
});

View.displayName = "View";

export { View };
