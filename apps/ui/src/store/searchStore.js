import {
  getCurrentTimeline,
  getIntegerOptions,
  groupTalentsByMatch,
} from "@allocate-core/util-data-values";
import { createWithEqualityFn } from "zustand/traditional";

const dropdownsInitialState = {
  projects: [],
  roles: [],
  skills: [],
  yoeFrom: getIntegerOptions(0, 30, 1),
  yoeTo: getIntegerOptions(0, 30, 1),
};

const initialRecommendation = {
  recommendations: {
    sameRole: {
      displayName: "Same Role",
      matches: {},
      count: 10,
    },
    otherRoles: {
      displayName: "Other Roles",
      matches: {},
      count: 10,
    },
    talents: [],
  },
};
const initialProjectsDetail = () => {
  let initialData = JSON.parse(localStorage.getItem("quick-search"));
  return initialData?.projects || [];
};
const initialPostionDetail = () => {
  let initialData = JSON.parse(localStorage.getItem("quick-search"));
  return initialData?.positions[0] || [];
};

const searchStore = (set, get) => ({
  ...initialRecommendation,
  dropdowns: dropdownsInitialState,
  projects: initialProjectsDetail(),
  positionValues: initialPostionDetail(),
  pageNumber: 1,
  showRelatedSuggestions: false,
  lastElement: null,
  currentTab: 0,
  month: new Date().getMonth(),
  currentTimeline: [],
  isFirstTab: false,
  isLastTab: false,

  setRecommendations: (result) =>
    set(
      (prevState) => ({
        recommendations: {
          ...result,
          ...prevState.recommendations,
          talents: [...prevState.recommendations.talents, ...result.talents],
          sameRole: {
            ...prevState.recommendations.sameRole,
            count: get().showRelatedSuggestions
              ? prevState.recommendations.sameRole.count
              : result.count,
            matches: {
              ...groupTalentsByMatch(get().showRelatedSuggestions ? [] : result.talents, {
                ...prevState.recommendations.sameRole.matches,
              }),
            },
          },
          otherRoles: {
            ...prevState.recommendations.otherRoles,
            count: get().showRelatedSuggestions
              ? result.count
              : prevState.recommendations.otherRoles.count,
            matches: {
              ...groupTalentsByMatch(get().showRelatedSuggestions ? result.talents : [], {
                ...prevState.recommendations.otherRoles.matches,
              }),
            },
          },
        },
      }),
      false,
      "set recommendations",
    ),
  setDropdowns: (newState) =>
    set({ dropdowns: { ...get().dropdowns, ...newState } }, false, "Set Dropdown Values"),

  setProjects: (value) => set(() => ({ projects: value }), false, "Set Projects"),

  setPositionValues: (value) =>
    set(() => ({ positionValues: value }), false, "Set Position Values"),

  setPageNumber: (value) => set(() => ({ pageNumber: value }), false, "Set Page Number"),
  incrementPageNumber: () =>
    set(
      (prevState) => ({ pageNumber: prevState.pageNumber + 1 }),
      false,
      "Increment Page Number",
    ),
  setShowRelatedSuggestions: (value) =>
    set(() => ({ showRelatedSuggestions: value }), false, "Show Related Suggestions"),

  setLastElement: (value) =>
    set(() => ({ lastElement: value }), false, "Set Last Element"),

  setCurrentTab: (value, buttonFor) =>
    set(
      (prevState) => {
        if (buttonFor === "View previous Role")
          return { currentTab: get().isFirstTab ? value : prevState.currentTab - 1 };
        if (buttonFor === "view next Role")
          return {
            currentTab: get().isLastTab ? value : prevState.currentTab + 1,
          };
        else return { currentTab: value };
      },
      false,
      "Set Current Tab",
    ),

  incrementMonth: () =>
    set((prevState) => ({ month: prevState.month + 1 }), false, "Increment Month"),

  decrementMonth: () =>
    set((prevState) => ({ month: prevState.month - 1 }), false, "Decrement Month"),

  setCurrentTimeline: (month) =>
    set(
      () => ({ currentTimeline: getCurrentTimeline(month) }),
      false,
      "Set Current Timeline Month",
    ),

  setIsFirstTab: (value) => set(() => ({ isFirstTab: value }), false, "Set First Tab"),
  setIsLastTab: (value) => set(() => ({ isLastTab: value }), false, "Set Last Tab"),
  resetRecommendations: () =>
    set(
      () => ({ recommendations: { ...initialRecommendation.recommendations } }),
      false,
      "Reset Recommendations",
    ),

  resetStore: () => {
    localStorage.removeItem("quick-search");
    set(
      () => ({
        ...initialRecommendation,
        dropdowns: dropdownsInitialState,
        projects: initialProjectsDetail(),
        positionValues: initialPostionDetail(),
        pageNumber: 1,
        showRelatedSuggestions: false,
        lastElement: null,
        currentTab: 0,
        month: new Date().getMonth(),
        currentTimeline: [],
        isFirstTab: false,
        isLastTab: false,
      }),
      false,
      "reset store",
    );
  },
  setInitialState: () => {
    set(
      () => ({
        ...initialRecommendation,
        dropdowns: dropdownsInitialState,
        projects: initialProjectsDetail(),
        positionValues: initialPostionDetail(),
        pageNumber: 1,
        showRelatedSuggestions: false,
        lastElement: null,
        currentTab: 0,
        month: new Date().getMonth(),
        currentTimeline: [],
        isFirstTab: false,
        isLastTab: false,
      }),
      false,
      "initial state reset",
    );
  },
});

export const useSearchStore = createWithEqualityFn(searchStore);
