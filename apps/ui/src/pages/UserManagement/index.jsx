import {
  Button,
  Heading,
  Modal,
  ReactSelect,
  SearchInput,
  Table,
  Text,
} from "@allocate-core/ui-components";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import AddIcon from "/icons/addWhite.svg";
import MenuIcon from "/icons/menuIcon.svg";

import { getUserGroups, getUserManagementList } from "../../api/userManagement";
import { debounce, isMobile } from "../../common/common";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import MobileModal from "../../components/MobileModal/MobileModal";
import accessRoles from "../../constants/accessRoles";
import { CONFIRMATION_MSG, DEFAULT_ITEMS_PER_PAGE } from "../../constants/common";
import { ROLES } from "../../constants/roles";
import ChangeAccess from "./ChangeAccess";
import NewUserForm from "./NewUserForm";
import styles from "./userManagement.module.css";

const UserManagement = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isChangeAccessModalOpen, setIsChangeAccessModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [userGroupList, setUserGroupList] = useState([]);
  const [userChangeValue, setUserChangeValue] = useState({
    name: "",
    role: "",
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [maxPageCount, setMaxPageCount] = useState(1);
  const [lastElement, setLastElement] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPageNumber((prev) => prev + 1);
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

  const fetchData = (searchQuery) => {
    setIsLoading(true);
    getUserManagementList({
      show_management: true,
      search: searchQuery || searchValue,
      page: pageNumber,
      size: DEFAULT_ITEMS_PER_PAGE,
    })
      .then((response) => {
        const resultsNotInList =
          Math.min(pageNumber * DEFAULT_ITEMS_PER_PAGE, response.count) >
          userGroupList.length;
        if (pageNumber === 1 && userGroupList.length === 0) {
          setUserGroupList(response.users);
        } else if (resultsNotInList) {
          setUserGroupList((prev) => [...prev, ...response.users]);
        }
        setMaxPageCount(Math.ceil(response.count / DEFAULT_ITEMS_PER_PAGE));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const debouncedHandler = useCallback(debounce(fetchData, 500), []);

  useEffect(() => {
    if (pageNumber > maxPageCount) return;
    if (!searchValue.length) fetchData();
  }, [pageNumber]);

  const handleUpdate = () => {
    setUserGroupList([]);
    setMaxPageCount(1);
    setPageNumber(1);
  };

  useEffect(() => {
    handleUpdate();
    if (searchValue?.length) debouncedHandler(searchValue);
  }, [searchValue]);

  const handleAccessChangeOnCancel = () => setIsChangeAccessModalOpen(false);
  const handleAccessChangeOnChange = () => {
    setIsChangeAccessModalOpen(false);
    handleUpdate();
  };

  const listTableColumns = [
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
      cell: ({ row }) => (
        <ReactSelect
          value={rolesOptions.find((option) => option.value === row.original.groupId)}
          options={rolesOptions}
          onChange={(option) => {
            setIsChangeAccessModalOpen(true);
            setUserChangeValue({
              user: row.original,
              role: option,
            });
          }}
          isDisabled={row.original.groupName === ROLES.superAdmin}
        />
      ),
    },
  ];

  return (
    <section className={styles.mainSection}>
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex justify-between gap-30">
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              User Management
            </Heading>
          </div>
        </Header>
      </header>

      <section className={styles.section}>
        <header className={`hidden-sm-down ${styles.header}`}>
          <Heading size="h4" fontWeight="bold">
            User Management
          </Heading>
        </header>
        <div className={`${styles.actionsBox} row`}>
          <div className="col-xl-4">
            <SearchInput
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              showCloseBtn
            />
          </div>
          <div
            className={`${!isMobile ? "col" : undefined} ${styles.addClientFloatingBtn}`}
          >
            <Button
              variant="primary"
              className="ml-auto"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <img src={AddIcon} alt="plus icon add new member" />
              {!isMobile && (
                <Text size="b2" fontWeight="semibold">
                  Add New Member
                </Text>
              )}
            </Button>
          </div>
        </div>
        {isMobile ? (
          userGroupList?.map((member, idx) => {
            const isLastElement = idx === userGroupList.length - 1;
            return (
              <div
                key={member.id}
                ref={isLastElement ? setLastElement : undefined}
                className={`row ${styles.userRow}`}
              >
                <div className="col-xl-12 flex gap-20">
                  <Text fontWeight="medium">{member.employeeId}</Text>
                  <Text fontWeight="medium">{member.userName}</Text>
                </div>
                <div className="col-xl-12 mt-16">
                  <ReactSelect
                    value={rolesOptions.find((option) => option.value === member.groupId)}
                    options={rolesOptions}
                    onChange={(option) => {
                      setIsChangeAccessModalOpen(true);
                      setUserChangeValue({
                        user: member,
                        role: option,
                      });
                    }}
                    isDisabled={member.groupName === ROLES.superAdmin}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <Table
            isLoading={isLoading}
            columns={listTableColumns}
            tableData={userGroupList}
            disableRowClick
            hidePagination
            isInfiniteScroll
            setLastElement={setLastElement}
          />
        )}
      </section>

      {isMobile ? (
        <MobileModal
          title="Change Access"
          isOpen={isChangeAccessModalOpen}
          showCloseBtn={false}
          showTitle
        >
          <ChangeAccess
            userChangeValue={userChangeValue}
            onCancel={handleAccessChangeOnCancel}
            onChange={handleAccessChangeOnChange}
          />
        </MobileModal>
      ) : (
        <Modal
          size="sm"
          title="Change Access"
          isOpen={isChangeAccessModalOpen}
          showCloseBtn={false}
          isMobile={isMobile}
        >
          <ChangeAccess
            userChangeValue={userChangeValue}
            onCancel={handleAccessChangeOnCancel}
            onChange={handleAccessChangeOnChange}
          />
        </Modal>
      )}

      <Modal
        size="lg"
        title="Add New Member"
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        showOnCloseAlert
        preventCloseOnOutsideClick
        confirmation_msg={CONFIRMATION_MSG}
        isMobile={isMobile}
      >
        <NewUserForm
          onSave={() => {
            setIsAddMemberModalOpen(false);
            handleUpdate();
          }}
          onCancel={() => {
            if (window.confirm(CONFIRMATION_MSG)) setIsAddMemberModalOpen(false);
          }}
        />
      </Modal>
    </section>
  );
};

export default UserManagement;
