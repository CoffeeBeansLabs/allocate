import React, { useState } from "react";

import BinIcon from "../../assets/binIcon.svg";
import styles from "./rating.module.css";

const Rating = ({ score = 0, isEditable = false, handleOnChange = () => {} }) => {
  const [rating, setRating] = useState(score);
  const [hover, setHover] = useState(0);

  const handleDeleteRating = () => {
    setRating(0);
    setHover(0);
    handleOnChange(0);
  };

  return isEditable ? (
    <div className="flex align-center gap-20">
      <div className={styles.skillRating}>
        {[...Array(5)].map((item, idx) => {
          idx += 1;
          return (
            <span
              key={`${item}_${idx}`}
              data-testid={`Rating_${
                idx <= ((rating && hover) || hover || rating) ? "filled" : "unfilled"
              }`}
              role="presentation"
              className={`${styles.editRatingBlock} ${
                idx <= ((rating && hover) || hover || rating) ? styles.filled : ""
              }`}
              onClick={() => {
                setRating(idx);
                handleOnChange(idx);
              }}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(rating)}
            />
          );
        })}
      </div>
      <div
        role="button"
        style={{ opacity: score > 0 ? 1 : 0 }}
        className={styles.binIcon}
        onClick={handleDeleteRating}
        onKeyDown={handleDeleteRating}
        tabIndex={0}
      >
        <img src={BinIcon} alt="remove rating" />
      </div>
    </div>
  ) : (
    <div className={styles.skillRating}>
      {new Array(5).fill(score).map((item, idx) => {
        return (
          <span
            key={idx}
            className={`${styles.ratingBlock} ${idx < score ? styles.filled : ""}`}
            data-testid={`Rating_${idx < score ? "filled" : "unfilled"}`}
          />
        );
      })}
    </div>
  );
};

export { Rating };
