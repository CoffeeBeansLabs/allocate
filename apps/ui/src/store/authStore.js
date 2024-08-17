import _ from "lodash";
import { createWithEqualityFn } from "zustand/traditional";

import { signOutUserSession } from "../api/login";
import { ROLES } from "../constants/roles";

const authStore = (set) => ({
  user: null,
  isAuthenticated: false,
  featureFlags: {
    assetModule: false,
  },
  signIn: (newUser, callback) => {
    if (!_.isEqual(newUser.roles, [ROLES.user])) {
      set(() => ({ user: newUser, isAuthenticated: true }), false, "sign in");
    }
    callback();
  },
  signOut: (callback) => {
    set(() => ({ user: null, isAuthenticated: false }), false, "sign out");
    signOutUserSession(callback);
  },
  setFeatureFlag: (allFeatureFlags) =>
    set(
      () => ({
        featureFlags: allFeatureFlags,
      }),
      false,
      "set all the feature flags",
    ),
});

export const useAuthStore = createWithEqualityFn(authStore);
