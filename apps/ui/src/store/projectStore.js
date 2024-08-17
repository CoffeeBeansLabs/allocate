import { createWithEqualityFn } from "zustand/traditional";

import projectStatusFilter from "../constants/projectStatusFilter";

const initialState = {
  projects: [],
  pageNumber: 1,
  maxPageCount: 1,
  dateRange: null,
  statusFilter: projectStatusFilter.find((option) => option.value === "all"),
  search: "",
};

const projectStore = (set) => ({
  ...initialState,
  setProjects: (projectList) =>
    set(() => ({ projects: projectList }), false, "set projects"),
  addProjects: (projectList) =>
    set(
      (prev) => ({
        projects: [...prev.projects, ...projectList],
      }),
      false,
      "add projects",
    ),
  setPageNumber: (number) => set(() => ({ pageNumber: number }), false, "set pageNo"),
  incrementPageNumber: () =>
    set((prev) => ({ pageNumber: prev.pageNumber + 1 }), false, "increment pageNo"),
  setMaxPageCount: (number) =>
    set(() => ({ maxPageCount: number }), false, "set max page count"),
  setDateRange: (dates) => set(() => ({ dateRange: dates }), false, "set dates"),
  setStatusFilter: (status) => set(() => ({ statusFilter: status }), false, "set status"),
  setSearch: (searchValue) => set(() => ({ search: searchValue }), false, "set search"),
  resetStore: () =>
    set(
      (prev) => {
        if (
          prev.dateRange === initialState.dateRange &&
          prev.statusFilter.value === initialState.statusFilter.value &&
          prev.search === initialState.search
        )
          return;
        return { ...initialState };
      },
      false,
      "reset store",
    ),
});

export const useProjectStore = createWithEqualityFn(projectStore);
