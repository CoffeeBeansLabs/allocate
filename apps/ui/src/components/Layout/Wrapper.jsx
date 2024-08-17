import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const Wrapper = ({ children, elementId }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [location.pathname]);
  return children;
};

export default Wrapper;
