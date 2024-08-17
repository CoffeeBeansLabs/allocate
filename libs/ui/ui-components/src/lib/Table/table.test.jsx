import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Table } from ".";

describe("tests for table component", () => {
  test("should display no data when table data is empty", () => {
    render(<Table tableData={[]} noDataMessage="No Data to view" hidePagination />);
    expect(screen.getByText("No Data to view")).toBeInTheDocument();
  });

  test("should display data in table format when passed", () => {
    const cols = [
      { header: "ID", accessorKey: "id" },
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
    ];
    const data = [
      { id: 5, name: "John", email: "john@example.com" },
      { id: 6, name: "Liam", email: "liam@example.com" },
    ];

    render(
      <Table
        columns={cols}
        tableData={data}
        noDataMessage=""
        maxHeight={300}
        isMaxHeight
      />,
    );
    expect(screen.queryAllByRole("rowgroup")).toHaveLength(2);
    expect(screen.queryAllByRole("row")).toHaveLength(data.length + 1); // data rows and header row
    expect(screen.queryAllByRole("cell")).toHaveLength(cols.length * (data.length + 1));
    expect(screen.queryByRole("row", { name: /id name email/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("row", { name: /5 john john@example.com/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("row", { name: /6 liam liam@example.com/i }),
    ).toBeInTheDocument();
  });

  test("should render pagination", async () => {
    render(
      <Table
        columns={[]}
        tableData={[...Array(12).keys()]}
        pagination={{
          pageSize: 3,
          pageCount: 4,
          pageIndex: 0,
          totalItems: 12,
        }}
      />,
    );

    expect(screen.queryByText(/3 of 12/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/click to view next page/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/click to view previous page/i)).toBeInTheDocument();
  });
});
