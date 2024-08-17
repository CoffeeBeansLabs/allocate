import { useHandleClickOutside } from "@allocate-core/util-hooks";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

import BackArrow from "../../assets/arrow-right.svg";
import CloseIconBlack from "../../assets/closeIconBlack.svg";
import { Heading } from "../Typography";
import styles from "./modal.module.css";

const Modal = ({
  size,
  title,
  isOpen,
  onClose,
  onOutsideClick,
  preventCloseOnOutsideClick = false,
  showCloseBtn = true,
  showOnCloseAlert = false,
  children,
  confirmation_msg,
  isMobile,
}) => {
  const modalRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => {
      if (typeof onOutsideClick === "function") {
        onOutsideClick();
      } else if (!preventCloseOnOutsideClick) {
        onClose();
      }
    },
    wrapperRef: modalRef,
  });

  useEffect(() => {
    if (showOnCloseAlert) {
      const handleBeforeUnload = (event) => {
        if (isOpen) {
          event.preventDefault();
          event.returnValue = "";
        }
      };

      if (isOpen) window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (showOnCloseAlert) {
      if (window.confirm(confirmation_msg)) onClose();
    } else {
      onClose();
    }
  };

  return isOpen ? (
    <div className={`${styles.modalBackdrop}`}>
      <div ref={modalRef} className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            {isMobile ? (
              <img
                role="presentation"
                src={BackArrow}
                alt="back button arrow"
                onClick={handleClose}
              />
            ) : null}
            <Heading
              size={isMobile ? "h6" : "h5"}
              fontWeight={isMobile ? "medium" : "bold"}
            >
              {title}
            </Heading>
            {showCloseBtn ? (
              <button className={styles.closeBtn} onClick={handleClose}>
                <img src={CloseIconBlack} alt="close icon" className={styles.closeIcon} />
              </button>
            ) : null}
          </div>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.modalChildren}>{children}</div>
        </div>
      </div>
    </div>
  ) : null;
};

Modal.defaultProps = {
  size: "md",
  onOutsideClick: null,
  showCloseBtn: true,
  showOnCloseAlert: false,
};

Modal.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onOutsideClick: PropTypes.func,
  showCloseBtn: PropTypes.bool,
  showOnCloseAlert: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
};

export { Modal };
