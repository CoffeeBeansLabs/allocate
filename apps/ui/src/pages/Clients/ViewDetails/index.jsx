import "react-toastify/dist/ReactToastify.css";

import {
  Badge,
  Button,
  Divider,
  Heading,
  Modal,
  Text,
} from "@allocate-core/ui-components";
import { useBackButton } from "@allocate-core/util-hooks";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import BackArrow from "/icons/arrow-right.svg";
import EditIcon from "/icons/editIcon.svg";
import EditIconBlack from "/icons/editIcon-black.svg";

import { getClientById } from "../../../api/client";
import { isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import Wrapper from "../../../components/Layout/Wrapper";
import PermissionGate from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import ClientForm from "../ClientForm";
import AccountManager from "./AccountManager";
import ClientDetails from "./ClientDetails";
import styles from "./clientViewDetails.module.css";
import PointOfContactSection from "./PointOfContactSection";
import ProjectDetails from "./ProjectDetails";

const ClientViewDetails = () => {
  const { id } = useParams();
  const [isEditClientsModalOpen, toggleEditClientsModal] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [basicDetailsTabOpen, setBasicDetailsTabOpen] = useState(true);
  const [projectDetailsTabOpen, setProjectDetailsTabOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    getClientById(id)
      .then((data) => setClientData(data))
      .catch((errResponse) => {
        toast.error(errResponse?.data?.detail);
      });
  }, [isEditClientsModalOpen, id]);

  const onEditSuccessHandler = () => {
    toggleEditClientsModal(false);
    toast.success("Client Edited!");
  };

  const onBack = () => {
    if (state) navigate(`/clients?lastPosition=${state.id}`);
    else navigate("/clients");
  };

  useEffect(() => {
    if (isMobile) useBackButton(onBack);
  }, []);

  return (
    <Wrapper elementId="client-heading">
      <Header className="row">
        <img
          src={BackArrow}
          alt="back button arrow"
          role="presentation"
          onClick={onBack}
        />

        <Heading size="h6" fontWeight="medium">
          Client Details
        </Heading>
        <PermissionGate
          scopes={[SCOPES.canUpdate]}
          permittedElement={() => (
            <img
              role="presentation"
              src={EditIconBlack}
              alt="edit button"
              className="ml-auto"
              onClick={() => {
                toggleEditClientsModal(true);
              }}
            />
          )}
        />
      </Header>
      {isMobile ? (
        <div className={`flex`} id="client-heading">
          <div
            role="presentation"
            className={`col-sm-6 ${styles.tabHeader} ${
              basicDetailsTabOpen ? styles.activeTab : styles.inactiveTab
            }`}
            onClick={() => {
              setBasicDetailsTabOpen(true);
              setProjectDetailsTabOpen(false);
            }}
          >
            <Text size="b2" fontWeight="semibold">
              Basic Details
            </Text>
          </div>
          <div
            role="presentation"
            className={`col-sm-6 ${styles.tabHeader} ${
              projectDetailsTabOpen ? styles.activeTab : styles.inactiveTab
            }`}
            onClick={() => {
              setProjectDetailsTabOpen(true);
              setBasicDetailsTabOpen(false);
            }}
          >
            <Text size="b2" fontWeight="semibold">
              Project Details
            </Text>
          </div>
        </div>
      ) : null}
      {basicDetailsTabOpen || !isMobile ? (
        <section className={styles.mainSection}>
          {isMobile ? (
            <>
              <header className="flex-center">
                <Heading
                  as="h1"
                  size="h5"
                  fontWeight="bold"
                  className={`${styles.clientName}`}
                >
                  {clientData?.name}
                </Heading>
                <div className="ml-auto">
                  <Badge variant={clientData?.status == "ACTIVE" ? "green" : "red"}>
                    {clientData?.status}
                  </Badge>
                </div>
              </header>
              <Divider />
            </>
          ) : (
            <div id="client-heading">
              <Text size="b2">Clients / View Details</Text>
              <header className={`flex ${styles.header}`}>
                <Heading
                  as="h1"
                  size="h4"
                  fontWeight="bold"
                  className={`${styles.clientName}`}
                >
                  {clientData?.name}
                </Heading>
                <div className="col-xl-3">
                  <Badge variant={clientData?.status == "ACTIVE" ? "green" : "red"}>
                    {clientData?.status}
                  </Badge>
                </div>
                <div className="col-xl-2 ml-auto">
                  <PermissionGate
                    scopes={[SCOPES.canUpdate]}
                    showPermittedElement
                    permittedElement={(hasPermission) => (
                      <Button
                        variant="secondary"
                        className={`ml-auto`}
                        onClick={() => {
                          toggleEditClientsModal(true);
                        }}
                        disabled={!hasPermission}
                      >
                        <img
                          src={EditIcon}
                          alt="Edit Icon"
                          style={{
                            width: "21px",
                            height: "21px",
                          }}
                        />
                        <Text size="b2" fontWeight="medium">
                          Edit
                        </Text>
                      </Button>
                    )}
                  />
                </div>
              </header>
            </div>
          )}
          <ClientDetails data={clientData} />
          <Divider />
          <PointOfContactSection data={clientData?.pocs} />
          <Divider />
          <AccountManager data={clientData?.accountManager} />
          {isMobile ? (
            <></>
          ) : (
            <>
              <Divider />
              <ProjectDetails data={clientData?.projects} />
            </>
          )}

          <Modal
            size="md"
            title="Edit Client Details"
            isOpen={isEditClientsModalOpen}
            onClose={() => {
              toggleEditClientsModal(false);
            }}
            showOnCloseAlert={formDirty}
            preventCloseOnOutsideClick={true}
            isMobile={isMobile}
          >
            <ClientForm
              type="edit"
              data={clientData}
              onEditSuccess={onEditSuccessHandler}
              setFormDirty={setFormDirty}
            />
          </Modal>
        </section>
      ) : (
        <ProjectDetails data={clientData?.projects} />
      )}
    </Wrapper>
  );
};

export default ClientViewDetails;
