import { useEffect } from "react";

function useHandleClickOutside({ onOutSideClick, wrapperRef }) {
  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  function handleClickOutside(event) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      onOutSideClick();
    }
  }
}
export { useHandleClickOutside };
