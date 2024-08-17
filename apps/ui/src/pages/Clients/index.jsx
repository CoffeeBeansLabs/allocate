import "react-toastify/dist/ReactToastify.css";

import {
  Button,
  Calendar,
  Heading,
  Modal,
  ReactSelect,
  SearchInput,
  Select,
  Table,
  Text,
} from "@allocate-core/ui-components";
import { formatDropdownList } from "@allocate-core/util-data-values";
import { formatClients } from "@allocate-core/util-formatting";
import { usePagination } from "@allocate-core/util-hooks";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import AddIcon from "/icons/addWhite.svg";
import ChevronIcon from "/icons/chevron.svg";
import FilterIcon from "/icons/filter.svg";
import MenuIcon from "/icons/menuIcon.svg";
import SearchIcon from "/icons/search.svg";

import { getAllClients } from "../../api/client";
import { getDropdowns } from "../../api/dropdowns";
import { debounce, isMobile } from "../../common/common";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import { Filter, Search } from "../../components/MobileComponents";
import MobileModal from "../../components/MobileModal/MobileModal";
import PermissionGate from "../../components/PermissionGate";
import { SCOPES } from "../../constants/roles";
import { useClientStore } from "../../store/clientStore";
import ClientForm from "./ClientForm";
import styles from "./clients.module.css";
import ClientSortDropDown from "./ClientSortDropDown";

const columns = [
  {
    header: "Client",
    accessorKey: "name",
    className: "col-xl-5",
    cell: (value) => (
      <Text size="b1" fontWeight="medium" data-testid="client_col">
        {value.getValue()}
      </Text>
    ),
  },
  {
    header: "Date of creation",
    accessorKey: "startDate",
    className: "col-xl-5 hidden-sm-down",
    cell: (value) => (
      <Text size="b1" fontWeight="medium">
        {value.getValue()}
      </Text>
    ),
  },
  {
    header: "Domain",
    accessorKey: "industry",
    className: "col-xl-2 hidden-sm-down",
    cell: (value) => (
      <Text size="b1" fontWeight="medium">
        {value.getValue()}
      </Text>
    ),
  },
];

const Clients = () => {
  const [dropdowns, setDropdowns] = useState([]);
  const [clients, setClients, addClients] = useClientStore(
    (state) => [state.clients, state.setClients, state.addClients],
    shallow,
  );
  const [pagination, setPagination] = usePagination();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useClientStore(
    (state) => [state.search, state.setSearch],
    shallow,
  );
  const [isAddClientsModalOpen, setIsAddClientsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useClientStore(
    (state) => [state.statusFilter, state.setStatusFilter],
    shallow,
  );
  const [dateValues, setDateValues] = useClientStore(
    (state) => [state.dateValues, state.setDateValues],
    shallow,
  );
  const [sortBy, setSortBy] = useClientStore(
    (state) => [state.sortBy, state.setSortBy],
    shallow,
  );
  const [pageNumber, incrementPageNumber, setPageNumber] = useClientStore(
    (state) => [state.pageNumber, state.incrementPageNumber, state.setPageNumber],
    shallow,
  );
  const [maxPageCount, setMaxPageCount] = useClientStore(
    (state) => [state.maxPageCount, state.setMaxPageCount],
    shallow,
  );
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [lastElement, setLastElement] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchMobile] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        incrementPageNumber();
      }
    }),
  );

  useEffect(() => {
    getDropdowns()
      .then((response) => {
        setDropdowns(formatDropdownList(response.status));
      })
      .catch((error) => {
        toast.error(error?.data?.detail);
      });
  }, []);

  const fetchData = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await getAllClients({
        page: isMobile ? pageNumber : pagination.pageIndex + 1,
        search: searchQuery || search,
        startDateEnd: dateValues ? dateValues[1]?.format("YYYY-MM-DD") : "",
        startDateStart: dateValues ? dateValues[0]?.format("YYYY-MM-DD") : "",
        status: statusFilter?.value,
        sort_by: sortBy?.value,
      });
      const resultsNotInList =
        Math.min(pageNumber * pagination.pageSize, response.count) > clients.length;
      if (isMobile) {
        if (pageNumber === 1 && clients.length === 0) {
          setClients(formatClients(response.clients));
        } else if (resultsNotInList) {
          addClients(formatClients(response.clients));
        }
        setMaxPageCount(Math.ceil(response.count / pagination.pageSize));
      } else {
        setClients(formatClients(response.clients));
        setPagination((state) => ({
          ...state,
          totalItems: response.count,
          pageCount: Math.ceil(response.count / pagination.pageSize),
        }));
      }
    } catch (errResponse) {
      toast.error(errResponse?.data?.detail);
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandler = useCallback(debounce(fetchData, 500), [
    dateValues,
    statusFilter?.value,
    sortBy?.value,
  ]);

  const handleChangeFilter = (isSearch = false) => {
    if (pagination.pageIndex === 0 && !isSearch) fetchData();
    else
      setPagination((state) => ({
        ...state,
        pageIndex: 0,
        totalItems: 0,
        pageCount: 0,
      }));
  };

  useEffect(() => {
    if (isMobile && pageNumber > maxPageCount) {
      return;
    }
    fetchData();
  }, [pagination.pageIndex, pageNumber]);

  useEffect(() => {
    handleChangeFilter();
  }, [statusFilter?.value, dateValues, sortBy?.value]);

  useEffect(() => {
    if (search === undefined) return;
    handleChangeFilter(true);
    search === "" ? fetchData() : debouncedHandler(search);
  }, [search]);

  useEffect(() => {
    if (isMobile) {
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
    }
  }, [lastElement]);

  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    const lastPosition = url.searchParams.get("lastPosition");
    const element = document.getElementById(lastPosition);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.search, clients]);

  const onSuccessHandler = () => {
    setIsAddClientsModal(false);
    handleChangeFilter();
    toast.success("Client Added!");
  };

  return (
    <section className={styles.section}>
      <div className={`hidden-md-up ${isNavOpen ? "show" : "hide"}`}>
        <MobileNav
          onClose={() => {
            setIsNavOpen(false);
          }}
        />
      </div>
      <header className="row hidden-md-up">
        <Header>
          <div className="flex justify-between" style={{ flexBasis: "35%" }}>
            <img
              src={MenuIcon}
              alt="toggle navigation menu"
              role="presentation"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              Clients
            </Heading>
          </div>
          <div className="flex gap-30 justify-between" style={{ flexBasis: "20%" }}>
            <img
              src={SearchIcon}
              alt="search for clients"
              role="presentation"
              onClick={() => setShowSearchMobile(!showSearchModal)}
            />
            <img
              src={FilterIcon}
              alt="filter clients"
              role="presentation"
              onClick={() => setShowFilterModal(!showFilterModal)}
            />
          </div>
        </Header>
      </header>
      <header className={`row no-gutters ${styles.header}`}>
        <Heading size="h4" fontWeight="bold" className="col-xl-2 hidden-sm-down">
          Clients
        </Heading>
        <div
          className={`${!isMobile && "col-xl-2 ml-auto"} ${styles.addClientFloatingBtn}`}
        >
          <PermissionGate
            scopes={[SCOPES.canCreate]}
            showPermittedElement
            permittedElement={(hasPermission) => (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={() => {
                  setIsAddClientsModal(true);
                }}
                disabled={!hasPermission}
              >
                <img src={AddIcon} alt="Add new client" />
                {!isMobile && (
                  <Text size="b2" fontWeight="semibold">
                    Add New Client
                  </Text>
                )}
              </Button>
            )}
          />
        </div>
      </header>
      <div className={`row ${styles.actionsBox} hidden-sm-down`}>
        <div className="col-xl-3">
          <SearchInput
            placeholder="Search clients here"
            value={search}
            showCloseBtn
            onClear={() => setSearch("")}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-xl-2 ml-auto">
          <Select
            icon={FilterIcon}
            placeholder="Filter"
            value={statusFilter}
            options={dropdowns}
            onChange={setStatusFilter}
          />
        </div>
        <div className="col-xl-4">
          <Calendar
            numberOfMonths={2}
            placeholder="Select date range"
            value={dateValues}
            onChange={setDateValues}
            showCloseBtn
            onClear={() => {
              setDateValues(null);
            }}
            range
          />
        </div>
        <div className="col-xl-3 mr-auto">
          <ReactSelect
            label={isMobile ? "Sort By" : ""}
            placeholder="Sort By"
            value={sortBy}
            options={ClientSortDropDown}
            onChange={setSortBy}
            isClearable={true}
            menuPlacement="auto"
          />
        </div>
      </div>
      {isMobile ? (
        <section className="hidden-md-up pt-16">
          {clients.length ? (
            clients.map((client, idx) => {
              const isLastElement = idx === clients.length - 1;
              return (
                <div
                  key={client?.id}
                  id={client?.id}
                  ref={isLastElement ? setLastElement : undefined}
                  className={styles.clientRowCard}
                  role="presentation"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/clients/details/${client?.id}`, {
                      state: {
                        id: client?.id,
                      },
                    });
                  }}
                >
                  <Text size="b2" fontWeight="medium">
                    {client?.name}
                  </Text>
                  <img
                    src={ChevronIcon}
                    className={`${styles.chevronRight} hidden-md-up`}
                    alt="chevron icon"
                    aria-hidden="true"
                  />
                </div>
              );
            })
          ) : (
            <div className="flex-center">No clients found</div>
          )}
        </section>
      ) : (
        <Table
          columns={columns}
          isLoading={loading}
          pagination={pagination}
          setPagination={setPagination}
          tableData={clients}
          onRowClick={(e, rowData) => {
            e.preventDefault();
            navigate(`/clients/details/${rowData.id}`);
          }}
          noDataMessage="No client has been added yet"
        />
      )}
      <Modal
        title="Add New Client"
        size="md"
        isOpen={isAddClientsModalOpen}
        onClose={() => {
          setIsAddClientsModal(false);
          handleChangeFilter();
        }}
        showOnCloseAlert={formDirty}
        preventCloseOnOutsideClick={true}
        isMobile={isMobile}
      >
        <ClientForm onAddSuccess={onSuccessHandler} setFormDirty={setFormDirty} />
      </Modal>
      {isMobile && showFilterModal && (
        <MobileModal
          onClose={() => {
            setShowFilterModal(false);
          }}
          isOpen={showFilterModal}
          title="Select Status"
          isFullScreen={false}
          showTitle={true}
        >
          <Filter
            for="Filter"
            initialState={{
              dates: dateValues,
              status: statusFilter,
              sort: sortBy,
            }}
            dropdown={dropdowns}
            sortDropdown={ClientSortDropDown}
            handleApplyFilter={(status, dates, sortBy) => {
              setStatusFilter(status);
              setDateValues(dates);
              setSortBy(sortBy);
              setClients([]);
              setMaxPageCount(1);
              setPageNumber(1);
              setShowFilterModal(false);
            }}
          />
        </MobileModal>
      )}
      {isMobile && showSearchModal && (
        <MobileModal
          onClose={() => {
            setShowSearchMobile(false);
          }}
          isOpen={showSearchModal}
          showTitle={true}
          title="Search Clients"
          showBackButton={true}
          isFullScreen={true}
        >
          <Search
            searchFor="clients"
            handleOnClick={(clientId) => {
              if (clientId) {
                navigate(`/clients/details/${clientId}`);
                setShowSearchMobile(false);
              }
            }}
            getSearchResults={getAllClients}
            formatResults={formatClients}
          />
        </MobileModal>
      )}
    </section>
  );
};

export default Clients;
