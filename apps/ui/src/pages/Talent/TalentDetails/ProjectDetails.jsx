import { Divider, Heading, Text } from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import React from "react";
import { useNavigate } from "react-router-dom";

const projectView = (project) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex-col pt-16"
      role="presentation"
      onClick={() => navigate(`/projects/details/${project?.projectId}`)}
      key={project?.projectId}
    >
      <Text size="b1" fontWeight="semibold">
        {project?.projectName}
        <Text size="b2" fontWeight="medium" className="col">
          ({project?.client?.name})
        </Text>
      </Text>
      <Text size="b2">Role: {project?.role}</Text>
      <Text size="b2">
        {getFormatedDate(project?.startDate)} - {getFormatedDate(project?.endDate)}
      </Text>
    </div>
  );
};

const ProjectDetails = ({ currentProjects, pastProjects }) => {
  return (
    <section className="mt-16">
      <Heading size="h6" fontWeight="semibold">
        Current Project(s)
      </Heading>
      {currentProjects.map((project) => projectView(project))}
      <Divider />
      <Heading size="h6" fontWeight="semibold">
        Past Project(s)
      </Heading>
      {pastProjects.map((project) => projectView(project))}
    </section>
  );
};

export default ProjectDetails;
