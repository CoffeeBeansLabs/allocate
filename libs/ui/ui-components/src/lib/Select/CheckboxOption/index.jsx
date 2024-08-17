import React, { useCallback, useState } from "react";
import { components } from "react-select";

const CheckboxOption = ({ isFocused, isSelected, children, innerProps, ...rest }) => {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = useCallback(() => setIsActive(true), []);
  const handleMouseUp = useCallback(() => setIsActive(false), []);
  const handleMouseLeave = useCallback(() => setIsActive(false), []);

  const backgroundColor = isActive ? "#B2D4FF" : isFocused ? "#eee" : "transparent";

  const style = {
    backgroundColor,
    color: "inherit",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "20px",
    paddingLeft: "20px",
  };

  const checkboxStyle = {
    appearance: "checkbox",
    width: "16px",
    height: "16px",
    cursor: "pointer",
  };

  const props = {
    ...innerProps,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    style,
  };

  return (
    <components.Option
      {...rest}
      isFocused={isFocused}
      isSelected={isSelected}
      innerProps={props}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        style={checkboxStyle}
      />
      {children}
    </components.Option>
  );
};

export { CheckboxOption };
