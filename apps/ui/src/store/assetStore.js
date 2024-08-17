import { createWithEqualityFn } from "zustand/traditional";

import assetsStatusFilter from "../constants/assetsStatusFilter";
import assetTypes from "../constants/assetTypes";

const initialState = {
  assets: [],
  statusValue: assetsStatusFilter.flatMap((group) =>
    group.options.filter((option) => option.value === "INV"),
  ),
  typeValue: assetTypes.filter((option) => option.value === "Hardware"),
  searchValue: "",
};

const assetStore = (set) => ({
  ...initialState,
  setAssets: (assetList) => set(() => ({ assets: assetList }), false, "set assets"),
  addAssets: (assetList) =>
    set(
      (prev) => ({
        assets: [...prev.assets, ...assetList],
      }),
      false,
      "add assets",
    ),
  setStatusValue: (value) =>
    set(() => ({ statusValue: value }), false, "set status value"),
  setTypeValue: (value) => set(() => ({ typeValue: value }), false, "set type value"),
  setSearchValue: (value) =>
    set(() => ({ searchValue: value }), false, "set search value"),
  resetStore: () => set(() => ({ ...initialState }), false, "reset asset store"),
});

export const useAssetStore = createWithEqualityFn(assetStore);
