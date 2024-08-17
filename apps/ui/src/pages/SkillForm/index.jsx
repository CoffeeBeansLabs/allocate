import { Heading, Spinner, Text } from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import GoogleIcon from "/icons/google.svg";
import CheckMarkIcon from "/icons/greenCheckMarkIcon.svg";

import { authenticateUser } from "../../api/login";
import {
  formPermission,
  getAllUserIndustries,
  getUserSkillsIndustries,
  updateUserSkillsIndustries,
} from "../../api/skillPortal";
import { FORM_HAS_PERMISSION } from "../../constants/skillPortalActions";
import ExperienceForm from "./ExperienceForm";
import styles from "./skillForm.module.css";
import UpdateIndustryForm from "./UpdateIndustryForm";
import UpdateSkillForm from "./UpdateSkillForm";

const GoogleAuthClientID = import.meta.env.CBST_GOOGLE_AUTH_CLIENT_ID;

const SkillForm = () => {
  const [hasFormPermission, setHasFormPermission] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    fullName: "",
  });
  const [mappingFormsPermissions, setMappingFormsPermissions] = useState({
    hasProficiencyMappingPermission: false,
    hasIndustryMappingPermission: false,
    hasUserExperiencePermissions: false,
  });
  const [isSkillsetFormOpen, setIsSkillsetFormOpen] = useState(false);
  const [isIndustryFormOpen, setIsIndustryFormOpen] = useState(false);
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [skillsetValues, setSkillsetValues] = useState([]);
  const [industryValues, setIndustryValues] = useState([]);
  const [industryDropdown, setIndustryDropdown] = useState([]);
  const [isSubmitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [experienceValues, setExperienceValues] = useState({
    careerStartDate: "",
    careerBreakMonths: 0,
  });

  const googleClient = useRef(null);

  async function handleCredentialResponse(response) {
    setIsLoading(true);
    try {
      const user = await authenticateUser(response);
      if (user) {
        setCurrentUser({
          id: user.id,
          fullName: user.firstName + " " + user.lastName,
        });
        setMappingFormsPermissions({
          hasProficiencyMappingPermission: user.hasProficiencyMappingPermission,
          hasIndustryMappingPermission: user.hasIndustryMappingPermission,
          hasUserExperiencePermissions: user.hasUserExperiencePermissions,
        });
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [isSkillsetFormOpen, isIndustryFormOpen, isExperienceFormOpen]);

  useEffect(() => {
    googleClient.current = window.google?.accounts.oauth2.initCodeClient({
      client_id: GoogleAuthClientID,
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      ux_mode: "popup",
      callback: handleCredentialResponse,
    });
  }, []);

  useEffect(() => {
    formPermission({
      action: FORM_HAS_PERMISSION,
    })
      .then((response) => setHasFormPermission(response.hasPermission))
      .catch((err) => toast.error(err?.data?.detail));
    getAllUserIndustries()
      .then((response) => setIndustryDropdown(formatDropdownList(response)))
      .catch((err) => toast.error(err?.data?.detail));
  }, []);

  useEffect(() => {
    if (mappingFormsPermissions.hasUserExperiencePermissions) {
      setIsExperienceFormOpen(true);
    } else if (mappingFormsPermissions.hasProficiencyMappingPermission) {
      setIsSkillsetFormOpen(true);
    } else if (mappingFormsPermissions.hasIndustryMappingPermission) {
      setIsIndustryFormOpen(true);
    } else {
      setHasFormPermission(false);
      return;
    }

    getUserSkillsIndustries(currentUser.id)
      .then((response) => {
        setIndustryValues(
          industryDropdown.filter((industry) =>
            response.user.industries.includes(industry.value),
          ),
        ),
          setSkillsetValues(response.user.skills);
      })
      .catch((err) => toast.error(err?.data.detail));
  }, [mappingFormsPermissions, currentUser]);

  const handleSubmit = () => {
    setIsLoading(true);
    const updatePayload = {
      skills: skillsetValues.filter((skill) => skill.rating > 0),
      industries: industryValues.map((industry) => industry.value),
    };
    updateUserSkillsIndustries(currentUser.id, updatePayload)
      .then(() => setSubmitted(true))
      .catch((err) => toast.error(err?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  if (!hasFormPermission) {
    return (
      <Heading size="h6" fontWeight="medium" className="flex-center col">
        This form is not accepting any entries right now
      </Heading>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex-col align-center gap-40">
        <Heading size="h6" fontWeight="medium">
          Thank You for Submitting!
        </Heading>
        <img
          src={CheckMarkIcon}
          alt="Success Green check mark icon"
          style={{ height: "100px", width: "100px" }}
        />
      </div>
    );
  }

  if (isLoading) return <Spinner />;

  return (
    <section>
      {!isSkillsetFormOpen && !isIndustryFormOpen && !isExperienceFormOpen ? (
        <div>
          <Heading size="h4" fontWeight="bold" className={styles.title}>
            Skills Portal
          </Heading>
          <div className="flex-center mt-16 pt-20">
            <button
              className={`${styles.loginBtn} flex-center`}
              onClick={() => {
                googleClient.current?.requestCode();
              }}
            >
              <img src={GoogleIcon} alt="Google logo" />
              <Text type="b2" fontWeight="medium">
                Sign in with Google
              </Text>
            </button>
          </div>
        </div>
      ) : isExperienceFormOpen ? (
        <ExperienceForm
          userId={currentUser.id}
          experienceValues={experienceValues}
          setExperienceValues={setExperienceValues}
          hasProficiencyMappingPermission={
            mappingFormsPermissions.hasProficiencyMappingPermission
          }
          hasIndustryMappingPermission={
            mappingFormsPermissions.hasIndustryMappingPermission
          }
          onNext={() => {
            setIsExperienceFormOpen(false);
            if (mappingFormsPermissions.hasProficiencyMappingPermission)
              setIsSkillsetFormOpen(true);
            else if (mappingFormsPermissions.hasIndustryMappingPermission)
              setIsIndustryFormOpen(true);
          }}
          onSubmit={() => setSubmitted(true)}
        />
      ) : isSkillsetFormOpen ? (
        <UpdateSkillForm
          name={currentUser.fullName}
          hasUserExperiencePermissions={
            mappingFormsPermissions.hasUserExperiencePermissions
          }
          hasIndustryMappingPermission={
            mappingFormsPermissions.hasIndustryMappingPermission
          }
          skillsetValues={skillsetValues}
          setSkillsetValues={setSkillsetValues}
          onBack={() => {
            setIsSkillsetFormOpen(false);
            setIsExperienceFormOpen(true);
          }}
          onNext={() => {
            setIsSkillsetFormOpen(false);
            setIsIndustryFormOpen(true);
          }}
          onSubmit={handleSubmit}
        />
      ) : (
        isIndustryFormOpen && (
          <UpdateIndustryForm
            name={currentUser.fullName}
            industryDropdown={industryDropdown}
            hasUserExperiencePermissions={
              mappingFormsPermissions.hasUserExperiencePermissions
            }
            hasProficiencyMappingPermission={
              mappingFormsPermissions.hasProficiencyMappingPermission
            }
            industryValues={industryValues}
            setIndustryValues={setIndustryValues}
            onBack={() => {
              setIsIndustryFormOpen(false);
              if (mappingFormsPermissions.hasProficiencyMappingPermission)
                setIsSkillsetFormOpen(true);
              else if (mappingFormsPermissions.hasUserExperiencePermissions)
                setIsExperienceFormOpen(true);
            }}
            onSubmit={handleSubmit}
          />
        )
      )}
    </section>
  );
};

export default SkillForm;
