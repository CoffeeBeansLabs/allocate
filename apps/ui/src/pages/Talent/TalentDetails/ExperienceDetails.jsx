import {
  Heading,
  InfoRow,
  ReactSelect,
  Text,
  Tooltip,
} from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import { getFormatedDate } from "@allocate-core/util-formatting";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import EditIcon from "/icons/editIcon.svg";

import { getPositionDropdowns } from "../../../api/dropdowns";
import { formatMonths, isMobile, sortArrayOfObjects } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import IndustryExp from "./IndustryExp";
import Skills from "./Skills";
import styles from "./talentDetails.module.css";

const ExperienceDetails = ({
  talentDetails,
  handleEdit = () => {},
  setRefetch = () => {},
}) => {
  const { id: talentId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [rolesDropdown, setRolesDropdown] = useState([]);
  const [roleValue, setRoleValue] = useState(null);

  const editInputRef = useRef(null);

  useEffect(() => {
    getPositionDropdowns()
      .then((response) => {
        const rolesOptions = formatDropdownList(response?.dropdowns?.roles);
        setRolesDropdown(rolesOptions);
        setRoleValue(rolesOptions.find((role) => role.value === talentDetails?.role?.id));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  }, []);

  useEffect(() => {
    if (roleValue)
      handleEdit(talentId, {
        role: roleValue?.value,
      }).catch((errorResponse) => errorResponse?.data?.detail);
  }, [roleValue]);

  useHandleClickOutside({
    onOutSideClick: () => {
      setRefetch(true);
      setIsEditMode(false);
    },
    wrapperRef: editInputRef,
  });

  const sortedSkills = sortArrayOfObjects(talentDetails?.skills, {
    key: "rating",
    asc: false,
  });

  return (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Experience Details
      </Heading>

      <InfoRow
        title="Role"
        titleStyle={isMobile ? "col" : "col-xl-4"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
        htmlValue={
          isEditMode ? (
            <div className={isMobile ? undefined : "col-xl-12 px-0"} ref={editInputRef}>
              <ReactSelect
                value={roleValue}
                options={rolesDropdown}
                onChange={setRoleValue}
              />
            </div>
          ) : (
            <div className="flex align-center">
              <Text size="b1" fontWeight="medium">
                {talentDetails?.role?.name || "--"}
              </Text>
              <PermissionGate
                scopes={[SCOPES.canUpdatePeopleDetails]}
                permittedElement={() => (
                  <div
                    className={`ml-auto ${styles.editIcon}`}
                    role="button"
                    onClick={() => setIsEditMode(true)}
                    onKeyDown={() => setIsEditMode(true)}
                    tabIndex={0}
                  >
                    <img
                      src={EditIcon}
                      alt="Role Edit Icon"
                      className={styles.editIcon}
                    />
                  </div>
                )}
              />
            </div>
          )
        }
      />
      <InfoRow
        title="Total Experience"
        titleStyle={isMobile ? "col" : "col-xl-4"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
        htmlValue={
          <div className="flex align-center gap-10">
            <Text size="b1" fontWeight="medium">
              {formatMonths(talentDetails?.experienceMonths || 0) || "--"}
            </Text>
            <Tooltip
              content={
                <div>
                  <div className="flex justify-between gap-10">
                    <Text size="b3">Career Start Date:</Text>
                    <Text size="b3">
                      {getFormatedDate(talentDetails?.careerStartDate)}
                    </Text>
                  </div>
                  <div className="flex justify-between gap-20">
                    <Text size="b3">Career Break:</Text>
                    <Text size="b3">
                      {formatMonths(talentDetails?.careerBreakMonths || 0) || "--"}
                    </Text>
                  </div>
                </div>
              }
              direction={isMobile ? "left" : "bottom"}
            >
              <div className={styles.infoIcon}>
                <Text size="b1" fontWeight="bold">
                  i
                </Text>
              </div>
            </Tooltip>
          </div>
        }
      />
      <InfoRow
        title="Coffeebeans Exp"
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={formatMonths(talentDetails?.companyExperienceMonths || 0) || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <IndustryExp
        title="Industry Experience"
        data={talentDetails?.industries || []}
        handleEdit={handleEdit}
        setRefetch={setRefetch}
      />
      <Skills
        title="Skills"
        data={sortedSkills}
        talentID={talentDetails?.id}
        handleEdit={handleEdit}
        setRefetch={setRefetch}
      />
    </section>
  );
};

export default ExperienceDetails;
