import {
  Button,
  Heading,
  InfoRow,
  Input,
  ReactSelect,
  Text,
} from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import { useHandleClickOutside } from "@allocate-core/util-hooks";
import { formatISO, isBefore, startOfToday } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import CalendarBlueIcon from "/icons/calendarBlueIcon.svg";
import CbIcon from "/icons/cbIcon.svg";
import EditIcon from "/icons/editIcon.svg";
import GreyampIcon from "/icons/greyampIcon.svg";

import { removeTalentLWD } from "../../../api/talent";
import { isMobile } from "../../../common/common";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import talentFunctionOptions from "../../../constants/talentFunctionOptions";
import LWDConfirmModal from "./LWDConfirmModal";
import styles from "./talentDetails.module.css";

const BasicDetails = ({
  talentDetails,
  handleEdit = () => {},
  setRefetch = () => {},
}) => {
  const { id: talentId } = useParams();
  const [isEditMode, setIsEditMode] = useState({
    lwd: false,
    function: false,
    profiles: false,
  });
  const [functionValue, setFunctionValue] = useState(
    talentFunctionOptions.find((option) => talentDetails?.function === option.value),
  );
  const [lwdValue, setLwdValue] = useState(
    talentDetails?.lastWorkingDay ? new Date(talentDetails?.lastWorkingDay) : null,
  );
  const [profileValues, setProfileValues] = useState({
    cbLink: talentDetails?.cbProfileLink || "",
    gaLink: talentDetails?.gaProfileLink || "",
  });
  const [error, setError] = useState({
    cbLink: null,
    gaLink: null,
  });
  const [callHandleUpdate, setCallHandleUpdate] = useState(false);
  const [isLwdConfirmationOpen, setIsLwdConfirmationOpen] = useState(false);

  const editInputRef = useRef(null);
  const invalidURL_error = "Enter valid URL";
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    let payload = {};

    if (isEditMode.lwd && lwdValue) {
      if (isBefore(new Date(lwdValue), startOfToday())) {
        setIsLwdConfirmationOpen(true);
        return;
      } else
        payload = {
          lwd: lwdValue
            ? formatISO(new Date(lwdValue), { representation: "date" })
            : null,
        };
    }
    if (isEditMode.function && functionValue)
      payload = {
        function: functionValue?.value,
      };

    if (callHandleUpdate)
      handleEdit(talentId, payload)
        .catch((errorResponse) => errorResponse?.data?.detail)
        .finally(() => setRefetch(true));
  }, [callHandleUpdate]);

  const handleRemoveLWD = () => {
    setLwdValue("");
    removeTalentLWD(talentId)
      .catch((errorResponse) => errorResponse?.data?.detail)
      .finally(() => setRefetch(true));
  };

  useHandleClickOutside({
    onOutSideClick: () => {
      setCallHandleUpdate(true);
    },
    wrapperRef: editInputRef,
  });

  return (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Basic Details
      </Heading>
      <InfoRow
        title={"Employee Id"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.employeeId || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"DoJ"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={getFormatedDate(talentDetails?.dateOfJoining)}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Email ID"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.email || "--"}
        valueStyle={isMobile ? styles.email : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Mobile Number"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.phoneNumber || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"City"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.workLocation || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Country"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.country || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Gender"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.gender || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Category"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={talentDetails?.employeeType || "--"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <InfoRow
        title={"Reporting To"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        value={
          `${talentDetails?.reportingTo?.firstName} ${talentDetails?.reportingTo?.lastName}` ||
          "--"
        }
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
      />
      <PermissionGate
        scopes={[SCOPES.canViewLWD]}
        permittedElement={() => (
          <InfoRow
            title="LWD"
            titleStyle={isMobile ? "col" : "col-xl-4"}
            valueStyle={isMobile ? "col" : "col-xl-8"}
            className={styles.detailRow}
            htmlValue={
              isEditMode.lwd ? (
                <div
                  className={isMobile ? undefined : "col-xl-7 px-0"}
                  ref={editInputRef}
                >
                  <Input
                    value={lwdValue}
                    variant="date"
                    placeholder="Select LWD"
                    onChange={(value) => setLwdValue(value)}
                    showCloseBtn
                    onClear={handleRemoveLWD}
                  />
                </div>
              ) : (
                <div
                  className={`flex align-center ${
                    isMobile ? undefined : "col-xl-7 px-0"
                  }`}
                >
                  <Text size="b1" fontWeight="medium">
                    {getFormatedDate(talentDetails?.lastWorkingDay) || "--"}
                  </Text>
                  <PermissionGate
                    scopes={[SCOPES.canUpdatePeopleDetails]}
                    permittedElement={() => (
                      <div
                        className={`ml-auto ${
                          talentDetails?.currentStatus === "Closed" ? "hide" : "show"
                        }`}
                      >
                        <img
                          src={CalendarBlueIcon}
                          alt="LWD Edit Icon"
                          className={styles.editIcon}
                          role="presentation"
                          onClick={() =>
                            setIsEditMode((current) => ({ ...current, lwd: true }))
                          }
                        />
                      </div>
                    )}
                  />
                </div>
              )
            }
          />
        )}
      />

      <InfoRow
        title={"Function"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        valueStyle={isMobile ? "col" : "col-xl-8"}
        className={styles.detailRow}
        htmlValue={
          isEditMode.function ? (
            <div className={isMobile ? undefined : "col-xl-7 px-0"} ref={editInputRef}>
              <ReactSelect
                value={functionValue}
                options={talentFunctionOptions}
                onChange={setFunctionValue}
              />
            </div>
          ) : (
            <div
              className={`flex align-center  ${isMobile ? undefined : "col-xl-7 px-0"}`}
            >
              <Text size="b1" fontWeight="medium">
                {talentDetails?.function || "--"}
              </Text>
              <PermissionGate
                scopes={[SCOPES.canUpdatePeopleDetails]}
                permittedElement={() => (
                  <div className="ml-auto">
                    <img
                      src={EditIcon}
                      alt="Function Edit Icon"
                      className={styles.editIcon}
                      role="presentation"
                      onClick={() =>
                        setIsEditMode((current) => ({ ...current, function: true }))
                      }
                    />
                  </div>
                )}
              />
            </div>
          )
        }
      />
      <InfoRow
        title={"Profiles"}
        titleStyle={isMobile ? "col" : "col-xl-4"}
        valueStyle={isMobile ? (isEditMode.profiles ? "col-xl-12" : "col") : "col-xl-8"}
        className={styles.detailRow}
        htmlValue={
          isEditMode.profiles ? (
            <div className="flex-col gap-10 mt-16" ref={editInputRef}>
              <div className="flex align-center gap-10">
                <div className="col-xl-10 px-0">
                  <Input
                    value={profileValues.cbLink}
                    placeholder="Add Coffeebeans Profile link here"
                    onChange={(e) => {
                      setProfileValues((current) => ({
                        ...current,
                        cbLink: e.target.value,
                      }));
                      setError((state) => ({
                        ...state,
                        cbLink: isValidUrl(e.target.value) ? null : invalidURL_error,
                      }));
                    }}
                  />
                  <Text size="b3" className="error">
                    {error.cbLink}
                  </Text>
                </div>
                <img src={CbIcon} alt="Coffeebeans Icon for link to CB profile" />
              </div>
              <div className="flex align-center gap-10">
                <div className="col-xl-10 px-0">
                  <Input
                    value={profileValues.gaLink}
                    placeholder="Add Greyamp Profile link here"
                    onChange={(e) => {
                      setProfileValues((current) => ({
                        ...current,
                        gaLink: e.target.value,
                      }));
                      setError((state) => ({
                        ...state,
                        gaLink: isValidUrl(e.target.value) ? null : invalidURL_error,
                      }));
                    }}
                  />
                  <Text size="b3" className="error">
                    {error.gaLink}
                  </Text>
                </div>
                <img src={GreyampIcon} alt="Greyamp Icon for link to greyamp profile" />
              </div>
              <Button
                variant="primary"
                className={`ml-auto ${styles.saveButton}`}
                disabled={error.gaLink || error.cbLink}
                onClick={() => {
                  handleEdit(talentId, {
                    cbProfileLink: profileValues?.cbLink,
                    gaProfileLink: profileValues?.gaLink,
                  })
                    .then(() => setRefetch(true))
                    .catch((errorResponse) => errorResponse?.data?.detail);
                  setIsEditMode((current) => ({ ...current, profiles: false }));
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <div
              className={
                isMobile
                  ? "flex gap-10 align-center"
                  : "col-xl-7 px-0 flex gap-10 align-end"
              }
            >
              <a
                href={talentDetails?.cbProfileLink}
                target="_blank"
                className={`${
                  !talentDetails?.cbProfileLink || talentDetails?.cbProfileLink === "-"
                    ? "hide"
                    : "show"
                }`}
                rel="noreferrer"
              >
                <img src={CbIcon} alt="Coffeebeans Icon for link to CB profile" />
              </a>
              <a
                href={talentDetails?.gaProfileLink}
                target="_blank"
                className={talentDetails?.gaProfileLink ? "show" : "hide"}
                rel="noreferrer"
              >
                <img src={GreyampIcon} alt="Greyamp Icon for link to greyamp profile" />
              </a>
              <PermissionGate
                scopes={[SCOPES.canUpdatePeopleDetails]}
                permittedElement={() => (
                  <div className="ml-auto">
                    <img
                      src={EditIcon}
                      alt="Profile Link Edit Icon"
                      className={styles.editIcon}
                      role="presentation"
                      onClick={() =>
                        setIsEditMode((current) => ({ ...current, profiles: true }))
                      }
                    />
                  </div>
                )}
              />
            </div>
          )
        }
      />
      <LWDConfirmModal
        isOpen={isLwdConfirmationOpen}
        onCancel={() => {
          setIsLwdConfirmationOpen(false);
          setIsEditMode((current) => ({ ...current, lwd: false }));
          setRefetch(true);
        }}
        onConfirm={() => {
          handleEdit(talentId, {
            lwd: formatISO(new Date(lwdValue), { representation: "date" }),
          })
            .catch((errorResponse) => errorResponse?.data?.detail)
            .finally(() => setRefetch(true));
        }}
      />
    </section>
  );
};

export default BasicDetails;
