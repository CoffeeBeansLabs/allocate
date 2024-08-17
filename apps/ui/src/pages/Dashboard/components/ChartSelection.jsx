import { RadioButton, ReactSelect, Text } from "@allocate-core/ui-components";
import React, { useEffect } from "react";

import styles from "./components.module.css";

export const formatSelectedValue = (changedOption, isProject = false) => {
  const changedLabel = (
    <Text size="b1">
      {isProject ? "Project: " : "Role: "}
      <Text fontWeight="semibold">{changedOption.label}</Text>
    </Text>
  );
  return {
    label: changedLabel,
    value: changedOption.value,
  };
};

const ChartSelection = ({
  selectedValue,
  setSelectedValue,
  dropdowns,
  choices,
  setChoices,
  choiceValue,
  setChoiceValue,
}) => {
  const handleRadioOptionChange = () => {
    const isProject = choiceValue.value === "Project";
    setChoices((prev) => {
      return prev.map((option) => {
        if (option.value === choiceValue.value) {
          return {
            value: option.value,
            label: (
              <div className={styles.chartSelect}>
                <ReactSelect
                  placeholder={option.value}
                  value={isProject ? selectedValue?.project : selectedValue?.role}
                  options={isProject ? dropdowns.projects : dropdowns.roles}
                  onChange={(changedOption) =>
                    setSelectedValue((prev) => {
                      const updateValue = formatSelectedValue(changedOption, isProject);
                      return {
                        project: isProject ? updateValue : prev.project,
                        role: isProject ? prev.role : updateValue,
                      };
                    })
                  }
                />
              </div>
            ),
          };
        } else {
          return {
            value: option.value,
            label: option.value,
          };
        }
      });
    });
  };

  useEffect(() => {
    handleRadioOptionChange();
  }, [choiceValue]);

  return (
    <RadioButton
      options={choices}
      value={choiceValue}
      onChange={setChoiceValue}
      mandatoryField={false}
    />
  );
};

export default React.memo(ChartSelection);
