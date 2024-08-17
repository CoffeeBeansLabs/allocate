import { getIntegerOptions } from "@allocate-core/util-data-values";
import _ from "lodash";
import { createWithEqualityFn } from "zustand/traditional";

import talentFunctionFilter from "../constants/talentFunctionFilter";
import TalentStatusFilter from "../constants/talentStatusFilter";
import TalentDropDown from "../pages/Talent/TalentSorting/TalentDropDown";

const initialFilterState = {
  projects: [],
  skills: [],
  yoeFrom: null,
  yoeTo: null,
  availability: "",
  sortBy: null,
  status: TalentStatusFilter[0].options.filter(
    (option) => option.value === "Fully_Allocated" || option.value === "Cafe",
  ),
  function: talentFunctionFilter.find((func) => func.value === "Delivery"),
};

const initialDropdownState = {
  projects: [],
  skills: [],
  yoeFrom: getIntegerOptions(0, 30, 1),
  yoeTo: getIntegerOptions(0, 30, 1),
  sortBy: TalentDropDown,
  status: TalentStatusFilter,
  function: talentFunctionFilter,
};

const talentStore = (set, get) => ({
  filters: initialFilterState,
  dropdowns: initialDropdownState,
  talentList: [],
  talentCount: 0,
  lastElement: null,
  pageNumber: 1,
  maxPageCount: 1,
  searchValue: "",
  month: new Date().getMonth(),
  resetFromSamePage: false,

  setFilters: (newState) => set({ filters: { ...get().filters, ...newState } }),
  setDropdowns: (newState) => set({ dropdowns: { ...get().dropdowns, ...newState } }),
  setTalentList: (talent) =>
    set(() => ({ talentList: talent }), false, "set Talent List"),
  addTalent: (talent, hasPrev = false) =>
    set(
      (prevState) => ({
        talentList: hasPrev ? [...prevState.talentList, ...talent] : talent,
      }),
      false,
      "Add Talent",
    ),
  setTalentCount: (count) =>
    set(() => ({ talentCount: count }), false, "Set Talent Count"),
  setLastElement: (element) =>
    set(() => ({ lastElement: element }), false, "Set Last Element"),
  setPageNumber: (number) =>
    set(() => ({ pageNumber: number }), false, "Set Page Number"),
  setMaxPageCount: (number) =>
    set(() => ({ maxPageCount: number }), false, "Set Max PageCount"),
  setSearchValue: (value) =>
    set(() => ({ searchValue: value }), false, "Set Search Value"),
  incrementPageNumber: () =>
    set(
      (prevState) => ({ pageNumber: prevState.pageNumber + 1 }),
      false,
      "Increment Page Number",
    ),

  incrementMonth: () =>
    set((prevState) => ({ month: prevState.month + 1 }), false, "Increment Month"),
  decrementMonth: () =>
    set((prevState) => ({ month: prevState.month - 1 }), false, "Decrement Month"),
  setResetFromSamePage: (value) =>
    set(() => ({ resetFromSamePage: value }), false, "Set resetting from the page"),
  resetStore: () =>
    set(
      (prev) => {
        if (_.isEqual(prev.filters, initialFilterState) && prev.searchValue === "")
          return;
        return {
          filters: initialFilterState,
          talentList: [],
          talentCount: 0,
          lastElement: null,
          pageNumber: 1,
          maxPageCount: 1,
          searchValue: "",
        };
      },
      false,
      "Reset Store",
    ),
});

const useTalentStore = createWithEqualityFn(talentStore);
export { initialFilterState, useTalentStore };
