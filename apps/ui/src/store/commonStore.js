import { createWithEqualityFn } from "zustand/traditional";

const commonStore = (set) => ({
  lastPosition: null,
  hasNavigatedBack: false,
  universalSearchValue: "",
  resetQuickSearchForm: false,
  setLastPosition: (value) =>
    set(() => ({ lastPosition: value }), false, "set last scroll position"),
  setHasNavigatedBack: (value) =>
    set(() => ({ hasNavigatedBack: value }), false, "Set Navigated Back Value"),
  setUniversalSearchValue: (value) =>
    set(() => ({ universalSearchValue: value }), false, "set universal search value"),
  setResetQuickSearchForm: (value) =>
    set(
      () => ({ resetQuickSearchForm: value }),
      false,
      "set resetting of quick search form",
    ),
  resetStore: () =>
    set(() => ({ lastPosition: null, hasNavigatedBack: false }), false, "Reset Store"),
});

export const useCommonStore = createWithEqualityFn(commonStore);
