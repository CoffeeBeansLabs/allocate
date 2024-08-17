import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import ChevronIcon from "../../assets/chevron.svg";
import { Spinner } from "../Spinner";
import { Text } from "../Typography";
import styles from "./table.module.css";

const NoDataView = ({ noDataMessage = "No Data to display" }) => (
  <tr className="d-iBlock text-center">
    <Text as="td" size="b2" fontWeight="medium" className="d-iBlock">
      {noDataMessage}
    </Text>
  </tr>
);

const InfiniteScrollIsLoading = () => (
  <tr className="d-iBlock text-center">
    <Text as="td" size="b2" fontWeight="medium" className="d-iBlock">
      Loading…
    </Text>
  </tr>
);

const defaultData = [];

const Table = ({
  columns,
  tableData,
  isLoading,
  pagination,
  setPagination,
  hidePagination,
  disableRowClick,
  onRowClick,
  noDataMessage,
  isMaxHeight,
  maxHeight,
  headerStyles,
  isInfiniteScroll,
  setLastElement,
}) => {
  const table = useReactTable({
    data: tableData ?? defaultData,
    columns,
    pageCount: pagination.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
  });

  const TOTAL = pagination.totalItems;
  const FROM = pagination.totalItems ? pagination.pageSize * pagination.pageIndex + 1 : 0;
  const TO = Math.min(pagination.pageSize * (pagination.pageIndex + 1), TOTAL);

  return (
    <section>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className={`row align-center ${styles.header}`}
              style={headerStyles}
            >
              {headerGroup.headers.map((header) => {
                return header.isPlaceholder ? null : (
                  <td key={header.id} className={header.column.columnDef.className}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody
          className={styles.tbody}
          style={isMaxHeight ? { maxHeight, overflowY: "scroll" } : {}}
        >
          {isLoading && !isInfiniteScroll ? (
            <tr>
              <td>
                <Spinner />
              </td>
            </tr>
          ) : tableData.length > 0 ? (
            table.getRowModel().rows.map((row, rowIndex) => {
              const isLastElement = rowIndex === tableData.length - 1;
              return (
                <tr
                  key={row.id}
                  className={`row align-center ${styles.tableRow}`}
                  ref={isLastElement && isInfiniteScroll ? setLastElement : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    !disableRowClick && onRowClick(e, row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id} className={cell.column.columnDef.className}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <NoDataView noDataMessage={noDataMessage} />
          )}
          {isLoading && isInfiniteScroll ? <InfiniteScrollIsLoading /> : null}
        </tbody>
      </table>
      <div className={`row no-gutters ${hidePagination && "hide"}`}>
        <div className={`flex align-center ml-auto ${styles.pagination}`}>
          <Text size="b2">
            {FROM} &ndash; {` ${TO} of ${TOTAL}`}
          </Text>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous Page"
          >
            <img
              src={ChevronIcon}
              alt="Click to view previous page"
              className={styles.leftArrow}
            />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next Page"
          >
            <img
              src={ChevronIcon}
              alt="Click to view next page"
              className={styles.rightArrow}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

Table.defaultProps = {
  columns: [],
  tableData: [],
  isLoading: false,
  pagination: {
    pageSize: 0,
    pageCount: 0,
    pageIndex: 0,
    totalItems: 0,
  },
  setPagination: () => {},
  onRowClick: () => {},
  hidePagination: false,
  disableRowClick: false,
  isMaxHeight: false,
  maxHeight: 0,
  headerStyles: null,
  isInfiniteScroll: false,
  setLastElement: () => {},
};

export { Table };
