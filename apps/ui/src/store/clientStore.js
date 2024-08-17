import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import ClientSortDropDown from "../pages/Clients/ClientSortDropDown";

const initialState = {
  clients: [],
  pageNumber: 1,
  maxPageCount: 1,
  dateValues: null,
  statusFilter: {
    value: "ACTIVE",
    label: "Active",
  },
  sortBy: ClientSortDropDown.find((option) => option.value === "name_asc"),
  search: "",
};

const clientStore = (set) => ({
  ...initialState,
  setClients: (clientList) => set(() => ({ clients: clientList }), false, "set clients"),
  addClients: (clientList) =>
    set(
      (prev) => ({
        clients: [...prev.clients, ...clientList],
      }),
      false,
      "add clients",
    ),
  setPageNumber: (number) => set(() => ({ pageNumber: number }), false, "set pageNo"),
  incrementPageNumber: () =>
    set((prev) => ({ pageNumber: prev.pageNumber + 1 }), false, "increment pageNo"),
  setMaxPageCount: (number) =>
    set(() => ({ maxPageCount: number }), false, "set max page count"),
  setDateValues: (dates) => set(() => ({ dateValues: dates }), false, "set dates"),
  setStatusFilter: (status) => set(() => ({ statusFilter: status }), false, "set status"),
  setSortBy: (sort) => set(() => ({ sortBy: sort }), false, "set sort"),
  setSearch: (searchValue) => set(() => ({ search: searchValue }), false, "set search"),
  resetStore: () =>
    set(
      (prev) => {
        if (
          prev.dateValues === initialState.dateValues &&
          prev.statusFilter.value === initialState.statusFilter.value &&
          prev.sortBy.value === initialState.sortBy.value &&
          prev.search === initialState.search
        )
          return;

        return { ...initialState };
      },
      false,
      "reset store",
    ),
});

export const useClientStore = createWithEqualityFn(devtools(clientStore));
