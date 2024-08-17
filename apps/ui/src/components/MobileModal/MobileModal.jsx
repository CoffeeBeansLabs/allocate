import { Heading } from "@allocate-core/ui-components";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import PropTypes from "prop-types";
import React, { useRef } from "react";

import BackArrow from "/icons/arrow-right.svg";
import CloseIconBlack from "/icons/closeIconBlack.svg";

import styles from "./MobileModal.module.css";

const MobileModal = ({
  isOpen = true,
  onClose = () => {},
  showTitle = true,
  title = "",
  showBackButton = false,
  isFullScreen = false,
  onOutsideClick,
  preventCloseOnOutsideClick = false,
  showCloseBtn = true,
  children,
}) => {
  const mobileModalRef = useRef(null);

  useHandleClickOutside({
    onOutSideClick: () => {
      if (typeof onOutsideClick === "function") {
        onOutsideClick();
      } else if (!preventCloseOnOutsideClick) {
        onClose();
      }
    },
    wrapperRef: mobileModalRef,
  });

  return isOpen ? (
    <div className={styles.modalBackground}>
      <div
        ref={mobileModalRef}
        className={isFullScreen ? `${styles.fullScreenModal}` : `${styles.modalBody}`}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            {showBackButton ? (
              <img
                role="presentation"
                src={BackArrow}
                alt="back button arrow"
                onClick={onClose}
                className={styles.backButton}
              />
            ) : null}
            <Heading size={"h5"} fontWeight={"bold"}>
              {showTitle && title}
            </Heading>
            {showCloseBtn ? (
              <button className={styles.closeBtn} onClick={onClose}>
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

MobileModal.defaultProps = {
  onOutsideClick: null,
  showCloseBtn: true,
  showBackButton: false,
};

MobileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  showTitle: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  isFullScreen: PropTypes.bool,
  onOutsideClick: PropTypes.func,
  showCloseBtn: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
    .isRequired,
};

export default MobileModal;
