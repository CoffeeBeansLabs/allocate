import { Heading, Table, Text } from "@allocate-core/ui-components";
import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ChevronIcon from "/icons/chevron.svg";

import styles from "./talentDetails.module.css";

const TableData = ({
  data = [],
  forProject = true,
  heading = "",
  toggleButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(toggleButton);
  const handleOnClick = () => {
    setIsOpen(!isOpen);
  };

  const navigate = useNavigate();

  const columns = [
    {
      header: forProject ? "Project Name" : "Asset Name",
      accessorKey: forProject ? "projectName" : "assetName",
      className: "col",
      cell: (value) => {
        return <Text size="b1">{value.getValue()}</Text>;
      },
    },
    {
      header: "Client",
      accessorKey: "client",
      className: "col",
      cell: (value) => {
        return <Text size="b1">{value.getValue()?.name}</Text>;
      },
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      className: "col",
      cell: (value) => {
        return <Text size="b1">{format(new Date(value.getValue()), "PP")}</Text>;
      },
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      className: "col",
      cell: (value) => {
        return (
          <Text size="b1">
            {value.getValue() ? format(new Date(value.getValue()), "PP") : "-- -- --"}
          </Text>
        );
      },
    },
    {
      header: "Role",
      accessorKey: "role",
      className: "col",
      cell: (value) => {
        return <Text size="b1">{value.getValue()}</Text>;
      },
    },
  ];
  return (
    <div>
      <section className="hidden-sm-down">
        <div className={styles.sectionHeader}>
          <span>
            <Heading size="h6" className={styles.sectionTitle}>
              {heading}
            </Heading>
          </span>
          <span>
            <img
              src={ChevronIcon}
              alt="chevron icon"
              onClick={handleOnClick}
              role="presentation"
              className={`${styles.chevronIcon} ${isOpen ? styles.rotate180deg : ""}`}
            />
          </span>
        </div>
        {isOpen && (
          <div className="pt-20">
            <Table
              columns={columns}
              tableData={data}
              isLoading={false}
              isMaxHeight={true}
              maxHeight={200}
              hidePagination
              onRowClick={(e, rowData) => {
                e.preventDefault();
                navigate(`/projects/details/${rowData.projectId}`);
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default TableData;
