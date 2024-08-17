import { createWithEqualityFn } from "zustand/traditional";

const initialState = {
  employeeData: null,
  openPositionData: null,
  cafeSkillData: null,
  potentialCafeSkillData: null,
  overallSkillData: null,
  overallExperienceData: null,
  overallIndustryData: null,
  clientAllocationData: null,
  clientIndustryData: null,
  projectAllocationData: null,
  roleBreakupData: null,
  peopleData: null,
  sortAscOrder: {
    dashboardCafeSkills: true,
    openPositions: true,
    projectAllocation: true,
    roleBreakup: true,
    currentAllocOverallSkills: true,
    cafeAndPotentialCafeSkills: true,
    potentialCafeSkill: true,
    peopleOverallSkills: true,
    peopleOverallExperience: true,
    peopleOverallIndustries: true,
    clientIndustry: true,
    clientAllocation: true,
  },
};

const dashboardStore = (set) => ({
  ...initialState,
  setEmployeeData: (data) =>
    set(() => ({ employeeData: data }), false, "set employee data"),
  setOpenPositionData: (data) =>
    set(() => ({ openPositionData: data }), false, "set open positions data"),
  setCafeSkillData: (data) =>
    set(() => ({ cafeSkillData: data }), false, "set cafe skill data"),
  setPotentialCafeSkillData: (data) =>
    set(() => ({ potentialCafeSkillData: data }), false, "set potential cafe skill data"),
  setOverallSkillData: (data) =>
    set(() => ({ overallSkillData: data }), false, "set overall skill data"),
  setOverallExperienceData: (data) =>
    set(() => ({ overallExperienceData: data }), false, "set overall experience data"),
  setOverallIndustryData: (data) =>
    set(() => ({ overallIndustryData: data }), false, "set overall industry data"),
  setClientAllocationData: (data) =>
    set(() => ({ clientAllocationData: data }), false, "set client allocation data"),
  setClientIndustryData: (data) =>
    set(() => ({ clientIndustryData: data }), false, "set client industry data"),
  setProjectAllocationData: (data) =>
    set(() => ({ projectAllocationData: data }), false, "set project allocation data"),
  setRoleBreakupData: (data) =>
    set(() => ({ roleBreakupData: data }), false, "set role breakup data"),
  setPeopleData: (data) => set(() => ({ peopleData: data }), false, "set people data"),
  setSortAscOrder: (sortOrder) =>
    set(
      (prevState) => ({
        sortAscOrder: {
          ...prevState.sortAscOrder,
          ...sortOrder,
        },
      }),
      false,
      "set sort order Value",
    ),
  resetStore: () => set(() => ({ ...initialState }), false, "reset store"),
});

export const useDashboardStore = createWithEqualityFn(dashboardStore);
