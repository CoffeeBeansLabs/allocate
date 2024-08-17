import { Button, Divider, Heading, Table, Text } from "@allocate-core/ui-components";
import { format } from "date-fns";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { isMobile } from "../../../common/common";
import StatusIcons from "../../../constants/status";
import styles from "./clientViewDetails.module.css";

const ProjectDetails = ({ data = [] }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const StatusBadge = ({ statusValue, ...props }) => {
    const projectStatus = StatusIcons?.find((status) => status.type === statusValue);
    return (
      <div className={`flex-center ${styles.customLabel}`} {...props}>
        <img src={projectStatus.icon} alt="status icon" className={styles.iconImage} />
        <Text size="b2">{projectStatus.uiString}</Text>
      </div>
    );
  };

  const columns = [
    {
      header: "Project Name",
      accessorKey: "name",
      className: "col-xl-3",
      cell: (value) => {
        return <Text size="b1">{value.getValue()}</Text>;
      },
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      className: "col-xl-3",
      cell: (value) => {
        return <Text size="b1">{format(new Date(value.getValue()), "PP")}</Text>;
      },
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      className: "col-xl-3",
      cell: (value) => {
        return (
          <Text size="b1">
            {value.getValue() ? format(new Date(value.getValue()), "PP") : "-- -- --"}
          </Text>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "col-xl-1",
      cell: (value) => {
        return <StatusBadge statusValue={value.getValue()} />;
      },
    },
    {
      header: "Action",
      accessorKey: "id",
      className: "col-xl-2",
      cell: (value) => {
        return (
          <Link to={`/projects/timeline/${value.getValue()}`}>
            <Button
              variant="secondary"
              fontWeight="medium"
              onClick={(e) => e.stopPropagation()}
            >
              <Text size="b2" fontWeight="medium">
                Project Timeline
              </Text>
            </Button>
          </Link>
        );
      },
    },
  ];

  return isMobile ? (
    <section className={`${styles.projectDetails}`}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index}>
            <div
              className="flex"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/projects/timeline/${item.id}`, {
                  state: {
                    clientId: id,
                  },
                });
              }}
              role="presentation"
            >
              <Text size="b1" fontWeight="medium">
                {item.name}
              </Text>
              <StatusBadge statusValue={item.status} className="ml-auto" />
            </div>
            <Divider />
          </div>
        ))
      ) : (
        <Text size="b2" fontWeight="regular" className="flex-center">
          No project has been added yet
        </Text>
      )}
    </section>
  ) : (
    <section>
      <Heading size="h6" className={styles.sectionTitle}>
        Project Details
      </Heading>
      <div className="pt-20">
        <Table
          columns={columns}
          tableData={data}
          isLoading={false}
          hidePagination
          onRowClick={(e, rowData) => {
            e.preventDefault();
            navigate(`/projects/details/${rowData.id}`);
          }}
        />
      </div>
    </section>
  );
};

export default ProjectDetails;
