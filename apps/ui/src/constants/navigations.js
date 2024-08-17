import AllocationIconBlack from "/icons/allocationIcon-black.svg";
import AllocationIconWhite from "/icons/allocationIcon-white.svg";
import AssetsIconBlack from "/icons/assetsIcon-black.svg";
import AssetsIconWhite from "/icons/assetsIcon-white.svg";
import CafeIconBlack from "/icons/cafeIcon-black.svg";
import CafeIconWhite from "/icons/cafeIcon-white.svg";
import ClientProjectIconBlack from "/icons/clientProjectIcon-black.svg";
import ClientProjectIconWhite from "/icons/clientProjectIcon-white.svg";
import DashboardIconBlack from "/icons/dashboardIcon-black.svg";
import DashboardIconWhite from "/icons/dashboardIcon-white.svg";
import PeopleIconBlack from "/icons/peopleIcon-black.svg";
import PeopleIconWhite from "/icons/peopleIcon-white.svg";

import { useAuthStore } from "../store/authStore";
import { SCOPES } from "./roles";

export default () => {
  const auth = useAuthStore();
  const showAssetModule = auth?.featureFlags?.assetModule;
  const dashboardSubNav = [
    {
      text: "Dashboard",
      linkTo: "/",
      inactiveIcon: DashboardIconBlack,
      activeIcon: DashboardIconWhite,
    },
    {
      text: "Current Allocation",
      linkTo: "/dashboard/allocation",
      inactiveIcon: AllocationIconBlack,
      activeIcon: AllocationIconWhite,
    },
    {
      text: "Cafe and Potential",
      linkTo: "/dashboard/cafe",
      inactiveIcon: CafeIconBlack,
      activeIcon: CafeIconWhite,
    },
    {
      text: "People",
      linkTo: "/dashboard/people",
      inactiveIcon: PeopleIconBlack,
      activeIcon: PeopleIconWhite,
    },
    {
      text: "Client and Projects",
      linkTo: "/dashboard/client-project",
      inactiveIcon: ClientProjectIconBlack,
      activeIcon: ClientProjectIconWhite,
    },
    {
      text: "Assets",
      linkTo: "/dashboard/assets",
      inactiveIcon: AssetsIconBlack,
      activeIcon: AssetsIconWhite,
    },
  ];

  const navigationList = [
    {
      id: "dashboard",
      text: "Dashboard",
      linkTo: "/",
      activeLinks: ["/dashboard/"],
      scope: [SCOPES.canView],
      subNav: showAssetModule
        ? dashboardSubNav
        : dashboardSubNav.filter((subNav) => !subNav?.text?.includes("Assets")),
    },
    { id: "clients", text: "Clients", linkTo: "/clients", scope: [SCOPES.canView] },
    { id: "projects", text: "Projects", linkTo: "/projects", scope: [SCOPES.canView] },
    { id: "people", text: "People", linkTo: "/people", scope: [SCOPES.canView] },
    {
      id: "assets",
      text: "Assets",
      linkTo: "/assets",
      scope: showAssetModule ? [SCOPES.canAccessAssets] : [],
      subNav: [
        {
          text: "Hardware",
          linkTo: "/assets",
        },
        {
          text: "Software",
          linkTo: "/assets",
          disabled: true,
        },
      ],
    },
    {
      id: "quickSearch",
      text: "Quick Search",
      linkTo: "/quick-search",
      scope: [SCOPES.canView],
    },
  ];

  return navigationList;
};
