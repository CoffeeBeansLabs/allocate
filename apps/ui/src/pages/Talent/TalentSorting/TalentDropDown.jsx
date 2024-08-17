import ArrowDown from "/icons/arrow-down.svg";
import ArrowUp from "/icons/arrow-up.svg";

import { sortOptions } from "../../../constants/talentSorting";
import styles from "../talent.module.css";

const TalentDropDown = sortOptions.map((option) => ({
  value: option.value,
  label: (
    <div className={styles.sortByDropdown}>
      <div>{option.label.split(" ")[0]}</div>
      {option.label.split(" ")[1] === "ascending" ? (
        <img src={ArrowUp} alt="Arrow Up" className={styles.arrowStyles} />
      ) : (
        <img src={ArrowDown} alt="Arrow Down" className={styles.arrowStyles} />
      )}
    </div>
  ),
}));

export default TalentDropDown;
