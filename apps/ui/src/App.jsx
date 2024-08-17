import "./styles/bootstrapGrid.css";
import "./styles/utils.css";

import { Spinner } from "@allocate-core/ui-components";
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getAllFeatureFlags, isAuthenticated } from "./api/login";
import Layout from "./components/Layout";
import { ROLES } from "./constants/roles";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/Assets/AssetDetails";
import Clients from "./pages/Clients";
import ClientViewDetails from "./pages/Clients/ViewDetails";
import Dashboard from "./pages/Dashboard";
import AssetsDashboard from "./pages/Dashboard/Assets";
import Cafe from "./pages/Dashboard/Cafe";
import ClientProject from "./pages/Dashboard/ClientProject";
import CurrentAllocation from "./pages/Dashboard/CurrentAllocation";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import People from "./pages/Dashboard/People";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/Projects/ProjectDetails";
import ProjectTimeline from "./pages/Projects/Timeline";
import Recommendations from "./pages/Projects/Timeline/Recommendations";
import QuickSearch from "./pages/QuickSearch";
import SearchResult from "./pages/QuickSearch/SearchResults";
import SkillForm from "./pages/SkillForm";
import SkillLayout from "./pages/SkillForm/SkillLayout";
import SkillPortal from "./pages/SkillPortal";
import Talent from "./pages/Talent";
import TalentDetails from "./pages/Talent/TalentDetails";
import UserManagement from "./pages/UserManagement";
import { useAuthStore } from "./store/authStore";

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuthStore();
  const allAppUserRoles = [
    ROLES.superAdmin,
    ROLES.admin,
    ROLES.requester,
    ROLES.viewer,
    ROLES.inventoryManager,
  ];
  const showAssetModule = auth?.featureFlags?.assetModule;

  const fetchFeatureFlags = () => {
    const flags = localStorage.getItem("feature-flags");
    if (flags) {
      auth.setFeatureFlag(JSON.parse(flags));
      return;
    }
    getAllFeatureFlags()
      .then((response) => {
        auth.setFeatureFlag(response);
        localStorage.setItem("feature-flags", JSON.stringify(response));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  };

  useEffect(() => {
    setIsLoading(true);
    async function fetchUser() {
      const isSignedIn = await isAuthenticated();
      const user = JSON.parse(localStorage.getItem("user"));
      fetchFeatureFlags();
      if (isSignedIn) {
        auth.signIn(user, () => {
          navigate(location.pathname);
          setIsLoading(false);
        });
      } else if (location.pathname.includes("/skill-form")) {
        setIsLoading(false);
      } else {
        auth.signOut(() => {
          navigate("/login");
          setIsLoading(false);
        });
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (auth?.user) fetchFeatureFlags();
  }, [auth?.user]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Routes>
      {auth?.isAuthenticated && !location.pathname.includes("/skill-form") ? (
        <>
          <Route
            path="/projects"
            element={<Layout allowedRoles={allAppUserRoles} fullLayout />}
          >
            <Route path="timeline/:id" element={<ProjectTimeline />} />
            <Route
              path="recommendations/:projectId/:positionId"
              element={<Recommendations />}
            />
          </Route>

          <Route
            path="/quick-search"
            element={<Layout allowedRoles={allAppUserRoles} fullLayout />}
          >
            <Route path="" element={<QuickSearch />} />
            <Route path="results" element={<SearchResult />} />
          </Route>

          <Route
            path="/people"
            element={<Layout allowedRoles={allAppUserRoles} fullLayout />}
          >
            <Route index element={<Talent />} />
          </Route>

          <Route element={<Layout allowedRoles={allAppUserRoles} />}>
            <Route path="/clients">
              <Route index element={<Clients />} />
              <Route path="details/:id" element={<ClientViewDetails />} />
            </Route>
            <Route path="/projects">
              <Route index element={<Projects />} />
              <Route path="details/:id" element={<ProjectDetails />} />
            </Route>
            <Route path="/people/details/:id" element={<TalentDetails />} />
          </Route>

          {showAssetModule && (
            <Route
              element={
                <Layout
                  allowedRoles={[
                    ROLES.superAdmin,
                    ROLES.admin,
                    ROLES.requester,
                    ROLES.inventoryManager,
                  ]}
                />
              }
            >
              <Route path="/assets">
                <Route index element={<Assets />} />
                <Route path="details/:id" element={<AssetDetails />} />
              </Route>
            </Route>
          )}

          <Route element={<Layout allowedRoles={[ROLES.superAdmin, ROLES.admin]} />}>
            <Route path="/skill-portal">
              <Route index element={<SkillPortal />} />
            </Route>
          </Route>

          <Route element={<Layout allowedRoles={[ROLES.superAdmin]} />}>
            <Route path="user-management">
              <Route index element={<UserManagement />} />
            </Route>
          </Route>

          <Route path="/" element={<DashboardLayout allowedRoles={allAppUserRoles} />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard/">
              <Route index element={<Dashboard />} />
              <Route path="allocation" element={<CurrentAllocation />} />
              <Route path="cafe" element={<Cafe />} />
              <Route path="people" element={<People />} />
              <Route path="client-project" element={<ClientProject />} />
              {showAssetModule && <Route path="assets" element={<AssetsDashboard />} />}
            </Route>
            <Route path="*" element={<Dashboard />} />
          </Route>
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/skill-form" element={<SkillLayout />}>
            <Route index element={<SkillForm />} />
          </Route>
          <Route path="*" element={<Login />} />
        </>
      )}
    </Routes>
  );
}

export default App;
