import "react-toastify/dist/ReactToastify.css";

import { Spinner } from "@allocate-core/ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getProjectById, getProjectTimeline } from "../../../api/projects";
import { debounce } from "../../../common/common";
import ProjectTimelineHeader from "../components/ProjectTimelineHeader";
import { formatProjectDetails } from "../ProjectDetails";
import AddRolesView from "./AddRolesView";
import TimelineView from "./TimelineView";

const ProjectTimeline = () => {
  const { id: projectId } = useParams();

  const [refetch, setRefetch] = useState(true);
  const [isAddRolesModalOpen, setIsAddRolesModalOpen] = useState(false);
  const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState({});
  const [projectTimeline, setProjectTimeline] = useState({});
  const [searchValue, setSearchValue] = useState(undefined);

  const fetchData = (searchQuery) => {
    setIsLoading(true);
    Promise.all([
      getProjectById(projectId),
      getProjectTimeline(projectId, {
        search: searchQuery || searchValue,
      }),
    ])
      .then((response) => {
        setProjectDetails(formatProjectDetails(response[0].project));
        setProjectTimeline(() => {
          const timeline = response[1].project;
          const roles = timeline.roles.map((role) => ({
            ...role,
            positions: role.positions.map((pos, posIndex) => ({
              ...pos,
              positionNo: posIndex + 1,
            })),
          }));
          return { ...timeline, roles };
        });
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
        setRefetch(false);
      });
  };

  const debouncedHandler = useCallback(debounce(fetchData, 700), []);

  useEffect(() => {
    if (searchValue === undefined) return;
    searchValue === "" ? fetchData() : debouncedHandler(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (!isAddRolesModalOpen && refetch) {
      fetchData();
    }
  }, [isAddRolesModalOpen, refetch]);

  const onAddRole = () => {
    setIsAddRolesModalOpen(false);
    toast.success("Role Added!", {
      autoClose: 3000,
    });
    setRefetch(true);
  };

  if (isLoading) {
    return <Spinner />;
  }

  let currentView = null;
  if (!projectTimeline?.roles?.length) {
    currentView = (
      <AddRolesView
        onAddRole={onAddRole}
        isAddRolesModalOpen={isAddRolesModalOpen}
        setIsAddRolesModalOpen={setIsAddRolesModalOpen}
        projectDetails={projectDetails}
      />
    );
  } else {
    currentView = (
      <TimelineView
        onAddRole={onAddRole}
        projectDetails={projectDetails}
        projectTimeline={projectTimeline}
        isEditRolesModalOpen={isEditRolesModalOpen}
        setIsEditRolesModalOpen={setIsEditRolesModalOpen}
        isAddRolesModalOpen={isAddRolesModalOpen}
        setIsAddRolesModalOpen={setIsAddRolesModalOpen}
        setRefetch={setRefetch}
      />
    );
  }

  return (
    <React.Fragment>
      <ProjectTimelineHeader
        projectData={projectDetails}
        timelineData={projectTimeline}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        setIsAddRolesModalOpen={setIsAddRolesModalOpen}
        hideAddRoles={projectTimeline?.roles?.length}
      />
      {currentView}
    </React.Fragment>
  );
};

export default ProjectTimeline;
