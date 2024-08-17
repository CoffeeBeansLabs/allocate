import { toast } from "react-toastify";

import { updatePermissions } from "../../api/skillPortal";
import {
  EXPERIENCE_DISABLE,
  EXPERIENCE_ENABLE,
  FORM_DISABLE,
  FORM_ENABLE,
  INDUSTRIES_DISABLE,
  INDUSTRIES_ENABLE,
  SKILLSET_DISABLE,
  SKILLSET_ENABLE,
} from "../../constants/skillPortalActions";

export const handleFormEnable = (setState) => {
  setState(true);
  updatePermissions({
    action: FORM_ENABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleFormDisable = (setState) => {
  setState(false);
  updatePermissions({
    action: FORM_DISABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleSkillFormEnable = (setState) => {
  setState(true);
  updatePermissions({
    action: SKILLSET_ENABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleSkillFormDisable = (setState) => {
  setState(false);
  updatePermissions({
    action: SKILLSET_DISABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleIndustryFormEnable = (setState) => {
  setState(true);
  updatePermissions({
    action: INDUSTRIES_ENABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleIndustryFormDisable = (setState) => {
  setState(false);
  updatePermissions({
    action: INDUSTRIES_DISABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleExperienceFormEnable = (setState) => {
  setState(true);
  updatePermissions({
    action: EXPERIENCE_ENABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};

export const handleExperienceFormDisable = (setState) => {
  setState(false);
  updatePermissions({
    action: EXPERIENCE_DISABLE,
  }).catch((err) => toast.error(err?.data?.detail));
};
