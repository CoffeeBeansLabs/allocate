import PropTypes from "prop-types";

import { Button } from "../Button";
import styles from "./confirmation.module.css";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <dialog
    className={styles.modalOverlay}
    aria-labelledby="modalTitle"
    aria-describedby="modalDescription"
  >
    <div className={styles.modal}>
      <p id="modalDescription">{message}</p>
      <div className={styles.modalButtons}>
        <Button onClick={onCancel} className={styles.modalButton} variant="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} className={styles.modalButton} variant="primary">
          Dismiss
        </Button>
      </div>
    </div>
  </dialog>
);

ConfirmationModal.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export { ConfirmationModal };
