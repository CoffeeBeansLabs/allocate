import {
  Button,
  ReactSelect,
  SearchInput,
  Table,
  Text,
} from "@allocate-core/ui-components";
import React, { useState } from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";

import {
  getUserGroups,
  getUserManagementList,
  updateUserGroup,
} from "../../api/userManagement";
import { debounce, isMobile } from "../../common/common";
import accessRoles from "../../constants/accessRoles";
import styles from "./userManagement.module.css";

const DEFAULT_PAGE_SIZE = 10;

const NewUserForm = ({ onSave, onCancel }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addMemberSearchData, setAddMemberSearchData] = useState([]);
  const [addMemberData, setAddMemberData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [maxPageCount, setMaxPageCount] = useState(1);
  const [lastElement, setLastElement] = useState(null);
  const [refetch, setRefetch] = useState(true);
  const [rolesOptions, setRolesOptions] = useState([]);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPageNumber((prev) => prev + 1);
        setRefetch(true);
      }
    }),
  );

  useEffect(() => {
    setIsLoading(true);
    getUserGroups()
      .then((response) => {
        setRolesOptions(
          response.groups.map((group) => ({
            value: group.id,
            label: accessRoles.find((role) => role.role === group.name).UIString,
          })),
        );
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchData = (searchQuery) => {
    setIsLoading(true);
    getUserManagementList({
      show_management: false,
      search: searchQuery || searchValue,
      page: pageNumber,
      size: DEFAULT_PAGE_SIZE,
    })
      .then((response) => {
        const resultsNotInList =
          Math.min(pageNumber * DEFAULT_PAGE_SIZE, response.count) >
          addMemberSearchData.length;
        if (pageNumber === 1 && addMemberSearchData.length === 0) {
          setAddMemberSearchData(response.users);
        } else if (resultsNotInList) {
          setAddMemberSearchData((prev) => [...prev, ...response.users]);
        }
        setMaxPageCount(Math.ceil(response.count / DEFAULT_PAGE_SIZE));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
        setRefetch(false);
      });
  };

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement]);

  const debouncedHandler = useCallback(debounce(fetchData, 500), []);

  useEffect(() => {
    if (!refetch) return;
    if (pageNumber > maxPageCount) {
      return;
    }
    fetchData();
  }, [refetch]);

  useEffect(() => {
    if (searchValue === undefined) return;
    setAddMemberSearchData([]);
    setMaxPageCount(1);
    setPageNumber(1);
    searchValue === "" ? fetchData() : debouncedHandler(searchValue);
  }, [searchValue]);

  const handleChange = (value) => {
    setAddMemberData((prev) => {
      if (!prev.some((emp) => emp.id === value.id)) {
        return [...prev, value];
      } else {
        const index = prev.findIndex((emp) => emp.id === value.id);
        prev[index] = value;
        return [...prev];
      }
    });
  };

  const handleOnSave = () => {
    const payload = addMemberData.map((emp) => ({
      userId: emp.id,
      groupId: emp.groupId,
    }));
    updateUserGroup(payload)
      .then(() => {
        toast.success("User Roles Added");
        onSave();
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail));
  };

  const addMemberColumns = [
    {
      header: "Sr. No.",
      accessorKey: "id",
      className: "col-xl-1",
      cell: ({ row }) => {
        return (
          <Text size="b1" fontWeight="medium">
            {row.index + 1}
          </Text>
        );
      },
    },
    {
      header: "Employee Name",
      accessorKey: "userName",
      className: "col-xl-4",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Employee ID",
      accessorKey: "employeeId",
      className: "col-xl-3",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Access Type",
      accessorKey: "groupId",
      className: "col-xl-4",
      cell: ({ row }) => {
        const [accessRoleValue, setAccessRoleValue] = useState(
          rolesOptions.find((option) => option.value === row.original.groupId),
        );
        return (
          <ReactSelect
            value={accessRoleValue}
            options={rolesOptions}
            onChange={(option) => {
              setAccessRoleValue(option);
              addMemberData[row.index].groupId = option.value;
              addMemberData[row.index].groupName = option.label;
              handleChange(row.original);
            }}
          />
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <div className="col-xl-5 ml-auto">
        <SearchInput
          placeholder="Search for people"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClear={() => setSearchValue("")}
          showCloseBtn={true}
        />
        {searchValue?.length > 0 && (
          <div className={styles.resultsDropdown}>
            {addMemberSearchData.length ? (
              <ul>
                {addMemberSearchData.map((member, idx) => {
                  const isLastElement = idx === addMemberSearchData.length - 1;
                  return (
                    <li key={member.id} ref={isLastElement ? setLastElement : undefined}>
                      <button
                        className={styles.listButton}
                        onClick={() => {
                          setAddMemberData((prev) =>
                            prev.some((emp) => emp.id === member.id)
                              ? [...prev]
                              : [...prev, member],
                          );
                          setSearchValue("");
                        }}
                      >
                        {member.userName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Text className="flex-center">No User Found</Text>
            )}
            {isLoading && <Text className="flex-center">Loading...</Text>}
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="mt-16 pt-20">
          <div className="col flex justify-between align-center">
            <Text fontWeight="semibold">People</Text>
            <Text fontWeight="semibold">Access</Text>
          </div>
          {addMemberData?.map((member, idx) => (
            <div
              key={member.id}
              className={`pt-20 col flex gap-30 justify-between align-center ${styles.userRow}`}
            >
              <Text fontWeight="medium" className="col px-0">
                {member.userName} ({member.employeeId})
              </Text>
              <div className="col px-0">
                <ReactSelect
                  value={rolesOptions.find((option) => option.value === member.groupId)}
                  options={rolesOptions}
                  onChange={(option) => {
                    addMemberData[idx].groupId = option.value;
                    addMemberData[idx].groupName = option.label;
                    handleChange(member);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-20 mt-16">
          <Table
            columns={addMemberColumns}
            tableData={addMemberData}
            hidePagination
            disableRowClick
          />
        </div>
      )}
      <div className="col-xl-12 flex-center gap-30 mt-16 pt-20">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleOnSave}>
          Save
        </Button>
      </div>
    </React.Fragment>
  );
};

export default NewUserForm;
