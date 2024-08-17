import React, { useState } from "react";

import ChevronIcon from "/icons/chevron.svg";

import { isMobile } from "../../common/common";
import SkillsCard from "../../components/SkillsCard";

const TalentItem = React.forwardRef(({ divStyle, buttonComponent = <>

    </>, children, talentData }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        ref={ref}
        className={divStyle}
        role="presentation"
        style={{
          borderBottom: isOpen ? "none" : null,
        }}
      >
        <SkillsCard {...talentData} />
        {isMobile && (
          <img
            src={ChevronIcon}
            alt="chevron icon"
            role="presentation"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        )}
        {buttonComponent}
      </div>
      {isOpen ? <>{children}</> : null}
    </>
  );
});

TalentItem.displayName = "TalentItem";
export default TalentItem;
