import {
  Button,
  Calendar,
  Divider,
  Heading,
  Modal,
  SearchInput,
  Select,
  Table,
  Text,
} from "@allocate-core/ui-components";
import { formatProjects } from "@allocate-core/util-data-values";
import { usePagination } from "@allocate-core/util-hooks";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import AddIcon from "/icons/addWhite.svg";
import FilterIcon from "/icons/filter.svg";
import MenuIcon from "/icons/menuIcon.svg";
import SearchIcon from "/icons/search.svg";

import { getProjects } from "../../api/projects";
import { debounce, isMobile } from "../../common/common";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import { Filter, Search } from "../../components/MobileComponents";
import MobileModal from "../../components/MobileModal/MobileModal";
import PermissionGate from "../../components/PermissionGate";
import projectStatusFilter from "../../constants/projectStatusFilter";
import { SCOPES } from "../../constants/roles";
import { useProjectStore } from "../../store/projectStore";
import StatusLegends from "./components/StatusLegends";
import ProjectForm from "./ProjectForm";
import styles from "./projects.module.css";
import RowStatusSelect from "./RowStatusSelect";

const columns = [
  {
    id: 1,
    header: "Project",
    accessorKey: "name",
    className: "col-xl-4",
    cell: (value) => (
      <Text size="b1" fontWeight="medium">
        {value.getValue()}
      </Text>
    ),
  },
  {
    id: 2,
    header: "Client",
    accessorKey: "client",
    className: "col-xl-4",
    cell: (value) => (
      <Text size="b1" fontWeight="medium">
        {value.getValue()?.name}
      </Text>
    ),
  },
  {
    id: 3,
    header: "Status",
    accessorKey: "status",
    className: "col-xl-2",
    cell: ({ row }) => {
      return <RowStatusSelect value={row.original.status} projectId={row.original.id} />;
    },
  },
  {
    id: 4,
    header: "Action",
    accessorKey: "id",
    className: "col-xl-2 ml-auto",
    cell: (value) => (
      <Link to={`/projects/timeline/${value.getValue()}`}>
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Text size="b2" fontWeight="medium">
            Project Timeline
          </Text>
        </Button>
      </Link>
    ),
  },
];

const Projects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects, addProjects] = useProjectStore(
    (state) => [state.projects, state.setProjects, state.addProjects],
    shallow,
  );
  const [pagination, setPagination] = usePagination();
  const [statusFilter, setStatusFilter] = useProjectStore(
    (state) => [state.statusFilter, state.setStatusFilter],
    shallow,
  );
  const [dateRange, setDateRange] = useProjectStore(
    (state) => [state.dateRange, state.setDateRange],
    shallow,
  );
  const [searchValue, setSearchValue] = useProjectStore(
    (state) => [state.search, state.setSearch],
    shallow,
  );
  const [pageNumber, setPageNumber, incrementPageNumber] = useProjectStore(
    (state) => [state.pageNumber, state.setPageNumber, state.incrementPageNumber],
    shallow,
  );
  const [maxPageCount, setMaxPageCount] = useProjectStore(
    (state) => [state.maxPageCount, state.setMaxPageCount],
    shallow,
  );

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [lastElement, setLastElement] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
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

  const fetchData = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await getProjects({
        search: searchQuery || searchValue,
        startDateEnd: dateRange ? dateRange[1]?.format("YYYY-MM-DD") : "",
        startDateStart: dateRange ? dateRange[0]?.format("YYYY-MM-DD") : "",
        status: statusFilter?.value === "all" ? "" : statusFilter?.value,
        page: isMobile ? pageNumber : pagination.pageIndex + 1,
      });
      const resultsNotInList =
        Math.min(pageNumber * pagination.pageSize, response.count) > projects.length;
      if (isMobile) {
        if (pageNumber === 1 && projects.length === 0)
          setProjects(formatProjects(response.projects));
        else if (resultsNotInList) addProjects(formatProjects(response.projects));
        setMaxPageCount(Math.ceil(response.count / pagination.pageSize));
      } else {
        setProjects(formatProjects(response.projects));
        setPagination((state) => ({
          ...state,
          totalItems: response.count,
          pageCount: Math.ceil(response.count / state.pageSize),
        }));
      }
    } catch (errorResponse) {
      toast.error(errorResponse?.data?.detail);
    } finally {
      setIsLoading(false);
    }
  };

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

  const debouncedHandler = useCallback(debounce(fetchData, 500), [
    dateRange,
    statusFilter?.value,
  ]);

  useEffect(() => {
    if (isMobile && pageNumber > maxPageCount) return;
    fetchData();
  }, [pagination.pageIndex, pageNumber]);

  useEffect(() => {
    handleChangeFilter();
  }, [statusFilter?.value, dateRange]);

  useEffect(() => {
    if (searchValue === undefined) return;
    handleChangeFilter(true);
    searchValue === "" ? fetchData() : debouncedHandler(searchValue);
  }, [searchValue]);

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
  }, [projects, location.search]);

  const onSuccessHandler = () => {
    setIsAddProjectModalOpen(false);
    handleChangeFilter();
    toast.success("Project Created!");
  };

  return (
    <React.Fragment>
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
              role="presentation"
              alt="toggle navigation menu"
              onClick={() => setIsNavOpen(true)}
            />
            <Heading size="h6" fontWeight="medium">
              Projects
            </Heading>
          </div>
          <div className="flex gap-30 justify-between" style={{ flexBasis: "20%" }}>
            <img
              src={SearchIcon}
              role="presentation"
              alt="search for projects"
              onClick={() => setShowSearchModal(!showSearchModal)}
            />
            <img
              src={FilterIcon}
              role="presentation"
              alt="filter clients"
              onClick={() => setShowFilterModal(!showFilterModal)}
            />
          </div>
        </Header>
      </header>
      <div className={`flex bg-CadetGrey-op-10 hidden-md-up ${styles.projectHeader}`}>
        <Text size="b1">Client</Text>
        <Text size="b1">Status</Text>
      </div>
      <section className={`${styles.section}`}>
        <header className={`row ${styles.header}`}>
          <Heading size="h4" fontWeight="bold" className="col-xl-2 hidden-sm-down">
            Projects
          </Heading>
          <div
            className={`${!isMobile && "col-xl-3 ml-auto"} ${
              styles.addProjectFloatingBtn
            }`}
          >
            <PermissionGate
              scopes={[SCOPES.canCreate]}
              showPermittedElement
              permittedElement={(hasPermission) => (
                <Button
                  className="ml-auto"
                  variant="primary"
                  onClick={() => {
                    setIsAddProjectModalOpen(true);
                  }}
                  disabled={!hasPermission}
                >
                  <img src={AddIcon} alt="plus icon to add project" />
                  {!isMobile && (
                    <Text size="b2" fontWeight="semibold">
                      Add New Project
                    </Text>
                  )}
                </Button>
              )}
            />
          </div>
        </header>

        <div className={`row ${styles.actionsBox} hidden-sm-down`}>
          <div className="col-xl-4">
            <SearchInput
              placeholder="Search by project and client name"
              value={searchValue}
              showCloseBtn
              onClear={() => {
                setSearchValue("");
              }}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
          </div>
          <div className="col-xl-2 px-0 ml-auto">
            <Select
              icon={FilterIcon}
              placeholder={statusFilter.value}
              value={statusFilter}
              options={projectStatusFilter}
              onChange={setStatusFilter}
            />
          </div>
          <div className="col-xl-4">
            <Calendar
              numberOfMonths={2}
              placeholder="Select date range"
              value={dateRange}
              onChange={setDateRange}
              showCloseBtn
              onClear={() => {
                setDateRange(null);
              }}
              range
            />
          </div>
        </div>
        <div className="hidden-sm-down">
          <Table
            columns={columns}
            isLoading={isLoading}
            pagination={pagination}
            setPagination={setPagination}
            tableData={projects}
            onRowClick={(e, rowData) => {
              e.preventDefault();
              navigate(`/projects/details/${rowData.id}`);
            }}
            noDataMessage="No project has been added yet"
            forProject={true}
          />
          <StatusLegends />
        </div>
        <section className="hidden-md-up pt-16">
          {projects.length ? (
            projects.map((project, idx) => {
              const isLastElement = idx === projects.length - 1;
              return (
                <div
                  key={project?.id}
                  id={project?.id}
                  ref={isLastElement ? setLastElement : undefined}
                >
                  <div
                    className="flex align-center justify-between"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/projects/timeline/${project?.id}`, {
                        state: {
                          id: project?.id,
                        },
                      });
                    }}
                    role="presentation"
                  >
                    <div className="flex-col justify-end">
                      <Text size="b1" fontWeight="medium">
                        {project?.name}
                      </Text>
                      <Text size="b3" fontWeight="light">
                        {project?.client?.name}
                      </Text>
                    </div>
                    <div className={styles.statusSelect}>
                      <RowStatusSelect value={project?.status} projectId={project?.id} />
                    </div>
                  </div>
                  <Divider />
                </div>
              );
            })
          ) : (
            <div className="flex-center">No projects found</div>
          )}
        </section>
        <Modal
          title="Add New Project"
          size="md"
          onOutsideClick={() => {}}
          isOpen={isAddProjectModalOpen}
          onClose={() => {
            setIsAddProjectModalOpen(false);
            handleChangeFilter();
          }}
          showOnCloseAlert={formDirty}
          preventCloseOnOutsideClick={true}
          isMobile={isMobile}
        >
          <ProjectForm
            type="add"
            onSubmit={onSuccessHandler}
            setFormDirty={setFormDirty}
          />
        </Modal>
        {isMobile && showFilterModal && (
          <MobileModal
            onClose={() => {
              setShowFilterModal(false);
            }}
            isOpen={showFilterModal}
            showTitle={true}
            title="Select Status"
            isFullScreen={false}
            showBackButton={false}
          >
            <Filter
              initialState={{
                dates: dateRange,
                status: statusFilter,
                sort: null,
              }}
              dropdown={projectStatusFilter}
              handleApplyFilter={(status, dates) => {
                setStatusFilter(status);
                setDateRange(dates);
                setShowFilterModal(false);
                setMaxPageCount(1);
                setProjects([]);
                setPageNumber(1);
              }}
            />
          </MobileModal>
        )}
        {isMobile && showSearchModal && (
          <MobileModal
            onClose={() => {
              setShowSearchModal(false);
            }}
            isOpen={showSearchModal}
            showTitle={true}
            title="Search Projects"
            showBackButton={true}
            isFullScreen={true}
          >
            <Search
              searchFor="projects"
              handleOnClick={(projectId) => {
                if (projectId) {
                  navigate(`/projects/timeline/${projectId}`);
                  setShowSearchModal(false);
                }
              }}
              getSearchResults={getProjects}
              formatResults={formatProjects}
            />
          </MobileModal>
        )}
      </section>
    </React.Fragment>
  );
};

export default Projects;
