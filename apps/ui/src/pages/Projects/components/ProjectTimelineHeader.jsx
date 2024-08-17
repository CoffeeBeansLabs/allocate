import {
  Button,
  Divider,
  Heading,
  SearchInput,
  Text,
} from "@allocate-core/ui-components";
import { getFormatedDate } from "@allocate-core/util-formatting";
import { useBackButton } from "@allocate-core/util-hooks";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AddIcon from "/icons/addWhite.svg";
import BackArrow from "/icons/arrow-right.svg";
import NavigateIcon from "/icons/navigateIcon.svg";
import SearchIcon from "/icons/search.svg";

import { isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import MobileModal from "../../../components/MobileModal/MobileModal";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import styles from "../Timeline/timeline.module.css";

const ProjectTimelineHeader = ({
  projectData = {},
  timelineData = {},
  searchValue,
  setSearchValue,
  setIsAddRolesModalOpen,
  hideAddRoles,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState(searchValue);
  const navigate = useNavigate();
  const { state } = useLocation();

  const onBack = () => {
    if (state) {
      if (state.clientId) {
        navigate(`/clients/details/${state.clientId}`);
      } else {
        navigate(`/projects?lastPosition=${state.id}`);
      }
    } else {
      navigate("/projects");
    }
  };

  useEffect(() => {
    if (isMobile) useBackButton(onBack);
  }, []);

  return (
    <React.Fragment>
      <header className="hidden-md-up">
        <Header className="flex align-center">
          <img
            src={BackArrow}
            alt="back button arrow"
            role="presentation"
            onClick={onBack}
          />
          <Heading size="h6" fontWeight="medium">
            {projectData?.name}
          </Heading>
          <Link to={`/projects/details/${projectData.id}`} className="ml-auto">
            <img role="presentation" src={NavigateIcon} alt="Navigation icon" />
          </Link>
          {timelineData.roles?.length > 0 && (
            <img
              src={SearchIcon}
              alt="search for roles or talent"
              role="presentation"
              onClick={() => setShowModal(!showModal)}
            />
          )}
        </Header>
      </header>
      <header className={`flex align-center ${styles.timelineHeader}`}>
        <div className="hidden-sm-down col-xl-5 flex-col gap-10">
          <Text size="b2" className={styles.pageNavPosition}>
            Projects / Timeline
          </Text>
          <div className="flex align-center gap-10">
            <img src={projectData?.statusIcon} alt="status Icon" />
            <Heading as="h1" size="h4" fontWeight="bold">
              {projectData?.name}
            </Heading>
            <Link to={`/projects/details/${projectData.id}`} className={styles.navIcon}>
              <img src={NavigateIcon} alt="navigate icon" />
            </Link>
          </div>
        </div>

        <div className={`col-xl-4 flex align-center ${styles.detailHeader}`}>
          <div className={`flex-col flex-center ${styles.positions}`}>
            <Heading size="h6" fontWeight="semibold">
              {timelineData?.openPositions} / {timelineData?.totalPositions}
            </Heading>
            <Text size={isMobile ? "b4" : "b2"} fontWeight="regular">
              Open Positions
            </Text>
          </div>
          <div>
            <div className="flex gap-10">
              <Text size="b2" fontWeight="regular">
                Start Date:
              </Text>
              <Text size="b2" fontWeight="regular">
                {getFormatedDate(projectData?.startDate)}
              </Text>
            </div>
            <div className="flex gap-10">
              <Text size="b2" fontWeight="regular">
                End Date:
              </Text>
              <Text size="b2" fontWeight="regular">
                {getFormatedDate(projectData?.endDate)}
              </Text>
            </div>
          </div>
        </div>
        <div className={`${!isMobile && "col-xl-3 px-0"} flex-col gap-20`}>
          {hideAddRoles ? (
            <div className={`ml-auto`}>
              <PermissionGate
                scopes={[SCOPES.canCreate]}
                showPermittedElement
                permittedElement={(hasPermission) => (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsAddRolesModalOpen(true);
                    }}
                    className={styles.addRoleBtn}
                    disabled={projectData?.status === "CLOSED" || !hasPermission}
                  >
                    <img src={AddIcon} alt="plus icon for add" />
                    {!isMobile && (
                      <Text size="b2" fontWeight="semibold">
                        Add Roles
                      </Text>
                    )}
                  </Button>
                )}
              />
            </div>
          ) : null}
          <div className="hidden-sm-down col-xl-12 px-0">
            <SearchInput
              placeholder="Search talents or roles here"
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
        </div>
      </header>

      {isMobile && <Divider />}
      {isMobile && (
        <MobileModal
          showTitle={true}
          isFullScreen={false}
          isOpen={showModal}
          title="Search talents or roles here"
          onClose={() => setShowModal(false)}
        >
          <div style={{ marginTop: 27, marginLeft: 15, marginRight: 15 }}>
            <SearchInput
              placeholder="Search talents or roles here"
              value={query}
              defaultValue=""
              showCloseBtn
              onClear={() => {
                setQuery("");
                setSearchValue("");
              }}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setSearchValue(query);
                }
              }}
            />
          </div>
        </MobileModal>
      )}
    </React.Fragment>
  );
};

ProjectTimelineHeader.defaultProps = {
  data: {
    filledPositions: 0,
    totalPositions: 0,
  },
};

export default ProjectTimelineHeader;
