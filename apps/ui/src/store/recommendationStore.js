import { groupTalentsByMatch } from "@allocate-core/util-data-values";
import { createWithEqualityFn } from "zustand/traditional";

const initialStates = {
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
  showRelatedSuggestions: false,
  pageNumber: 1,
};

const recommendationStore = (set, get) => ({
  ...initialStates,
  searchValue: undefined,
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
      "set recommendation",
    ),
  setShowRelatedSuggestions: (value) =>
    set(() => ({ showRelatedSuggestions: value }), false, "set showRelatedSuggestions"),
  incrementPageNumber: () =>
    set(
      (prevState) => ({ pageNumber: prevState.pageNumber + 1 }),
      false,
      "increment page no.",
    ),
  setPageNumber: (value) => set(() => ({ pageNumber: value }), false, "set page no."),
  setSearchValue: (value) =>
    set(() => ({ searchValue: value }), false, "set search value"),
  setStoreForSearch: () => set(() => ({ ...initialStates }), false, "reset store"),
  resetStore: () =>
    set(() => ({ ...initialStates, searchValue: undefined }), false, "reset store"),
});

export const useRecommendationStore = createWithEqualityFn(recommendationStore);
