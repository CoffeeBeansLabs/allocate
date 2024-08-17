import {
  Button,
  Divider,
  Heading,
  Modal,
  Spinner,
  Text,
} from "@allocate-core/ui-components";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import BackArrow from "/icons/arrow-right.svg";
import EditIcon from "/icons/editIcon.svg";

import { getAssetById } from "../../../api/asset";
import { isMobile } from "../../../common/common";
import Header from "../../../components/Header";
import Wrapper from "../../../components/Layout/Wrapper";
import { CONFIRMATION_MSG } from "../../../constants/common";
import AssetsForm from "../AssetForm";
import styles from "./assetDetails.module.css";
import AssetInfo from "./AssetInfo";
import AssetTimeline from "./AssetTimeline";

const AssetDetails = () => {
  const { id: serialNum } = useParams();
  const [assetData, setAssetData] = useState(undefined);
  const [isArchive, setIsArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const navigate = useNavigate();

  const onBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setIsLoading(true);
    getAssetById(serialNum)
      .then((response) => setAssetData(response))
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  }, [refetch]);

  if (isLoading) return <Spinner />;

  const archiveText = isArchive ? "Unarchive" : "Archive";

  return (
    <Wrapper elementId="asset-heading">
      <div className={styles.mainSection}>
        <header className="hidden-md-up">
          <Header className="row">
            <img
              src={BackArrow}
              alt="back button arrow"
              role="presentation"
              onClick={onBack}
            />
            <Heading size="h6" fontWeight="medium" id="talent-heading">
              Details of selected Hardware/Software
            </Heading>
            <img
              src={EditIcon}
              alt="Edit asset details button"
              onClick={() => setIsEditModalOpen(true)}
              role="presentation"
              className={`ml-auto ${styles.icons}`}
            />
          </Header>
        </header>
        <Text size="b2" className="hidden-sm-down" id="asset-heading">
          Assets / View Details
        </Text>
        <header className={`flex align-center gap-40 ${styles.header} hidden-sm-down`}>
          <Heading as="h1" size="h4" fontWeight="bold">
            Details of selected Hardware/Software
          </Heading>
          <img
            src={EditIcon}
            alt="Edit asset details button"
            onClick={() => setIsEditModalOpen(true)}
            role="presentation"
            className={`ml-auto ${styles.icons}`}
          />
        </header>
        <AssetInfo data={assetData} />
        <Button
          variant="secondary"
          className={!isMobile && "ml-auto"}
          color="red"
          onClick={() => {
            if (window.confirm(`Are you sure you want to ${archiveText} your assets`))
              setIsArchive(!isArchive);
          }}
        >
          <Text size="b2" fontWeight="semibold">
            {archiveText} Asset
          </Text>
        </Button>
        {!isMobile && <Divider />}
        <Heading size="h6" className={styles.sectionTitle}>
          Timeline
        </Heading>
        <AssetTimeline timelineData={assetData?.timeline} />
      </div>

      <Modal
        title="Edit Asset Details"
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setRefetch(true);
        }}
        preventCloseOnOutsideClick
        showOnCloseAlert={formDirty}
        confirmation_msg={CONFIRMATION_MSG}
        isMobile={isMobile}
      >
        <AssetsForm
          type="edit"
          assetData={assetData}
          archiveAssets={isArchive}
          setFormDirty={setFormDirty}
          onCancel={() => {
            if (formDirty) {
              if (window.confirm(CONFIRMATION_MSG)) setIsEditModalOpen(false);
            } else {
              setIsEditModalOpen(false);
            }
          }}
          onSubmit={() => {
            setIsEditModalOpen(false);
            setRefetch(true);
          }}
        />
      </Modal>
    </Wrapper>
  );
};

export default AssetDetails;
