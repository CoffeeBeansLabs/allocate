import React from "react";
import { toast } from "react-toastify";

import { PERMISSIONS, ROLES } from "../../constants/roles";
import { useAuthStore } from "../../store/authStore";

export const getPermission = (scopes) => {
  const scopesMap = {};
  const auth = useAuthStore();
  const role = auth?.user?.roles.find((role) => role !== ROLES.user);
  const permissions = PERMISSIONS[role];

  scopes.forEach((scope) => {
    scopesMap[scope] = true;
  });

  return permissions?.some((permission) => scopesMap[permission]);
};

const PermissionGate = ({
  permittedElement,
  scopes = [],
  showPermittedElement = false,
  showError = false,
}) => {
  const hasPermission = getPermission(scopes);

  if (showError) {
    toast.error("You do not have the Permission");
  }

  if (!hasPermission && !showPermittedElement) return <></>;

  return permittedElement(hasPermission);
};

export default PermissionGate;
