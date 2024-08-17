import {
  Heading,
  Input,
  MultiValueContainer,
  Spinner,
  Text,
  ToggleButton,
} from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import CopyIcon from "/icons/copyIcon.svg";
import MenuIcon from "/icons/menuIcon.svg";

import { getPositionDropdowns } from "../../api/dropdowns";
import {
  addIndustry,
  addSkill,
  deleteIndustry,
  deleteSkill,
  formPermission,
  getAllIndustries,
} from "../../api/skillPortal";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import {
  EXPERIENCE_HAS_PERMISSION,
  FORM_HAS_PERMISSION,
  FORM_LINK,
  INDUSTRY_HAS_PERMISSION,
  SKILL_HAS_PERMISSION,
} from "../../constants/skillPortalActions";
import {
  handleExperienceFormDisable,
  handleExperienceFormEnable,
  handleFormDisable,
  handleFormEnable,
  handleIndustryFormDisable,
  handleIndustryFormEnable,
  handleSkillFormDisable,
  handleSkillFormEnable,
} from "./handleSkillPortalToggle";
import styles from "./skillPortal.module.css";

const SkillPortal = () => {
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [isSkillsetEnabled, setIsSkillsetEnabled] = useState(false);
  const [isIndustryEnabled, setIsIndustryEnabled] = useState(false);
  const [isExperienceEnabled, setIsExperienceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refetch, setRefetch] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [existingValues, setExistingValues] = useState({
    skills: [],
    industries: [],
  });

  useEffect(() => {
    showCopied && setTimeout(() => setShowCopied(false), 3000);
  }, [showCopied]);

  useEffect(() => {
    if (!refetch) return;
    Promise.all([
      formPermission({
        action: FORM_HAS_PERMISSION,
      }),
      formPermission({
        action: SKILL_HAS_PERMISSION,
      }),
      formPermission({
        action: INDUSTRY_HAS_PERMISSION,
      }),
      formPermission({
        action: EXPERIENCE_HAS_PERMISSION,
      }),
    ])
      .then((response) => {
        setIsFormEnabled(response[0].hasPermission);
        setIsSkillsetEnabled(response[1].hasPermission);
        setIsIndustryEnabled(response[2].hasPermission);
        setIsExperienceEnabled(response[3].hasPermission);
      })
      .catch((err) => toast.error(err?.data?.detail))
      .finally(() =>
        Promise.all([getPositionDropdowns(), getAllIndustries()])
          .then((response) => {
            setExistingValues((current) => ({
              ...current,
              skills: formatDropdownList(response[0].dropdowns?.skills),
              industries: formatDropdownList(response[1]),
            }));
          })
          .catch((errResponse) => toast(errResponse?.data?.detail))
          .finally(() => {
            setIsLoading(false);
            setRefetch(false);
          }),
      );
  }, [refetch]);

  const handlePermissionToggle = (toggleValue, type) => {
    if (type === "form") {
      if (toggleValue) {
        handleFormEnable(setIsFormEnabled);
        if (!isSkillsetEnabled) handleSkillFormEnable(setIsSkillsetEnabled);
      } else {
        handleFormDisable(setIsFormEnabled);
        if (isSkillsetEnabled) handleSkillFormDisable(setIsSkillsetEnabled);
        if (isIndustryEnabled) handleIndustryFormDisable(setIsIndustryEnabled);
        if (isExperienceEnabled) handleExperienceFormDisable(setIsExperienceEnabled);
      }
    }

    if (type === "skillSet") {
      if (toggleValue) {
        handleSkillFormEnable(setIsSkillsetEnabled);
        if (!isFormEnabled) handleFormEnable(setIsFormEnabled);
      } else {
        handleSkillFormDisable(setIsSkillsetEnabled);
        if (!isIndustryEnabled && !isExperienceEnabled)
          handleFormDisable(setIsFormEnabled);
      }
    }

    if (type === "industries") {
      if (toggleValue) {
        handleIndustryFormEnable(setIsIndustryEnabled);
        if (!isFormEnabled) handleFormEnable(setIsFormEnabled);
      } else {
        handleIndustryFormDisable(setIsIndustryEnabled);
        if (!isSkillsetEnabled && !isExperienceEnabled)
          handleFormDisable(setIsFormEnabled);
      }
    }

    if (type === "experience") {
      if (toggleValue) {
        handleExperienceFormEnable(setIsExperienceEnabled);
        if (!isFormEnabled) handleFormEnable(setIsFormEnabled);
      } else {
        handleExperienceFormDisable(setIsExperienceEnabled);
        if (!isSkillsetEnabled && !isIndustryEnabled) handleFormDisable(setIsFormEnabled);
      }
    }
  };

  if (isLoading) return <Spinner />;

  const toastOption = {
    autoClose: 2000,
  };

  return (
    <section className={styles.mainSection}>
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex justify-between gap-30">
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              Skill Portal Access
            </Heading>
          </div>
        </Header>
      </header>
      <header className="hidden-sm-down">
        <Heading size="h4" fontWeight="bold">
          Skill Portal Access
        </Heading>
      </header>
      <section className={`${styles.sectionBody} flex-col`}>
        <div className="flex justify-between align-center">
          <Text size="b1" fontWeight="medium">
            Enable Form Access
          </Text>
          <ToggleButton
            toggled={isFormEnabled}
            onClick={(toggleValue) => handlePermissionToggle(toggleValue, "form")}
          />
        </div>
        <div className="flex justify-between align-center pt-20">
          <Text size="b1" fontWeight="medium">
            Allow Users to Access Skillset Data
          </Text>
          <ToggleButton
            toggled={isSkillsetEnabled}
            onClick={(toggleValue) => handlePermissionToggle(toggleValue, "skillSet")}
          />
        </div>
        <div className="flex justify-between align-center pt-20">
          <Text size="b1" fontWeight="medium">
            Allow Users to Access Industry Data
          </Text>
          <ToggleButton
            toggled={isIndustryEnabled}
            onClick={(toggleValue) => handlePermissionToggle(toggleValue, "industries")}
          />
        </div>
        <div className="flex justify-between align-center pt-20">
          <Text size="b1" fontWeight="medium">
            Allow Users to Access Experience Data
          </Text>
          <ToggleButton
            toggled={isExperienceEnabled}
            onClick={(toggleValue) => handlePermissionToggle(toggleValue, "experience")}
          />
        </div>
        <div className="flex-col gap-10 pt-20">
          <Text size="b1" fontWeight="medium">
            Add / Delete / Edit Skills:
          </Text>
          <MultiValueContainer
            variant="input"
            values={existingValues.skills}
            onDelete={(id) => {
              deleteSkill(id)
                .then(() => toast.success("Skill Deleted", toastOption))
                .catch((err) => toast.error(err?.data?.detail, toastOption))
                .finally(() => setRefetch(true));
            }}
            onAdd={(value) => {
              addSkill({ name: value })
                .then(() => toast.success(`Skill "${value}" Added`, toastOption))
                .catch((err) =>
                  toast.error(err?.data?.detail || err?.data?.name[0], toastOption),
                )
                .finally(() => setRefetch(true));
            }}
          />
        </div>
        <div className="flex-col gap-10 pt-20">
          <Text size="b1" fontWeight="medium">
            Add / Delete / Edit Industries:
          </Text>
          <MultiValueContainer
            variant="input"
            values={existingValues.industries}
            onDelete={(id) => {
              deleteIndustry(id)
                .then(() => toast.success("Industry Deleted", toastOption))
                .catch((err) => toast.error(err?.data?.detail, toastOption))
                .finally(() => setRefetch(true));
            }}
            onAdd={(value) => {
              addIndustry({ name: value })
                .then(() => toast.success(`Industry "${value}" Added`, toastOption))
                .catch((err) =>
                  toast.error(err?.data?.detail || err?.data?.name[0], toastOption),
                )
                .finally(() => setRefetch(true));
            }}
          />
        </div>
        <div className="col-xl-12 px-0 pt-20 flex align-end gap-10">
          <div className="col-xl-11 px-0 flex-col gap-10">
            <Text size="b1" fontWeight="medium">
              Form Link:
            </Text>
            <Input value={FORM_LINK} disabled />
          </div>
          <div className={`flex-col align-center ${styles.copyContainer}`}>
            <img
              src={CopyIcon}
              alt="Copy Link Icon"
              role="presentation"
              className={styles.copyIcon}
              onClick={() => {
                navigator.clipboard.writeText(FORM_LINK);
                setShowCopied(true);
              }}
            />
            <Text size="b4">{showCopied && "Copied!"}</Text>
          </div>
        </div>
      </section>
    </section>
  );
};

export default SkillPortal;
