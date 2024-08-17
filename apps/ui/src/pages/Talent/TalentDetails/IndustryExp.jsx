import { InfoRow, MultiValueContainer, Text } from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import EditIcon from "/icons/editIcon.svg";

import { getAllIndustries } from "../../../api/skillPortal";
import { isMobile } from "../../../common/common";
import PermissionGate, { getPermission } from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import styles from "./talentDetails.module.css";

const INDUSTRY_COUNT = 3;
const IndustryExp = ({ title = "", data = [], handleEdit, setRefetch }) => {
  const { id: talentId } = useParams();
  const [areAllIndustriesDisplayed, setareAllIndustriesDisplayed] = useState(false);
  const [industryLength, setIndustryLength] = useState(INDUSTRY_COUNT);
  const [industry, setIndustry] = useState(data);
  const [isEditMode, setIsEditMode] = useState(false);
  const [industryValues, setIndustryValues] = useState(formatDropdownList(data));
  const [industryDropdown, setIndustryDropdown] = useState([]);
  const hasPermission = getPermission([SCOPES.canUpdatePeopleDetails]);

  useEffect(() => {
    if (hasPermission)
      getAllIndustries()
        .then((response) => setIndustryDropdown(formatDropdownList(response)))
        .catch((errResponse) => toast.error(errResponse?.data?.detail));
  }, []);

  useEffect(() => {
    setareAllIndustriesDisplayed(
      data.length > 0 && data.length === industryLength ? true : false,
    );
    setIndustry(data.slice(0, industryLength));
  }, [industryLength, data]);

  const editInputRef = useRef();

  useHandleClickOutside({
    onOutSideClick: () => {
      setRefetch(true);
      setIsEditMode(false);
    },
    wrapperRef: editInputRef,
  });

  return (
    <InfoRow
      title={title}
      titleStyle={isMobile ? "col" : "col-xl-4"}
      valueStyle={isMobile ? "col-xl-12" : "col-xl-8"}
      className={styles.detailRow}
      htmlValue={
        isEditMode ? (
          <div className={styles.inputContainer} ref={editInputRef}>
            <MultiValueContainer
              variant="select"
              options={industryDropdown}
              values={industryValues}
              onDelete={(valueToRemove) =>
                setIndustryValues((current) => {
                  const modifiedIndustryList = current.filter(
                    (item) => item.value !== valueToRemove,
                  );
                  handleEdit(talentId, {
                    industries: modifiedIndustryList.map((industry) => industry.value),
                  }).catch((errorResponse) => errorResponse?.data?.detail);
                  return modifiedIndustryList;
                })
              }
              onAdd={(valueToAdd) =>
                setIndustryValues((current) => {
                  const modifiedIndustryList = !current.some(
                    (item) => item.value === valueToAdd.value,
                  )
                    ? current.concat(valueToAdd)
                    : current;
                  handleEdit(talentId, {
                    industries: modifiedIndustryList.map((industry) => industry.value),
                  }).catch((errorResponse) => errorResponse?.data?.detail);
                  return modifiedIndustryList;
                })
              }
            />
          </div>
        ) : (
          <div className="flex-col">
            <PermissionGate
              scopes={[SCOPES.canUpdatePeopleDetails]}
              permittedElement={() => (
                <div
                  className="ml-auto"
                  role="button"
                  onClick={() => setIsEditMode(true)}
                  onKeyDown={() => setIsEditMode(true)}
                  tabIndex={0}
                >
                  <img
                    src={EditIcon}
                    alt="Industry Edit Icon"
                    className={styles.editIcon}
                  />
                </div>
              )}
            />
            <div className={`row ${styles.valuesContainer}`}>
              {industry?.map((item) => {
                return (
                  <div
                    key={item?.id}
                    className={`${styles.valueItem} flex align-center gap-10`}
                  >
                    <Text size="b2" fontWeight="bold">
                      {item?.name}
                    </Text>
                  </div>
                );
              })}
            </div>

            <Text
              size="b2"
              fontWeight="medium"
              className={styles.showMore}
              style={{ color: industry.length === 0 && "#a2a8b4" }}
              onClick={() => {
                setIndustryLength((current) =>
                  current === data.length ? INDUSTRY_COUNT : data.length,
                );
              }}
            >
              {data.length > 0 && data.length > INDUSTRY_COUNT
                ? areAllIndustriesDisplayed
                  ? "Show Less"
                  : "Show More"
                : ""}
            </Text>
          </div>
        )
      }
    />
  );
};

export default IndustryExp;
