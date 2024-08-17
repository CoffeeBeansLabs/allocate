import {
  Button,
  CheckboxOption,
  Heading,
  Modal,
  ReactSelect,
  SearchInput,
  Table,
  Text,
} from "@allocate-core/ui-components";
import { usePagination } from "@allocate-core/util-hooks";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shallow } from "zustand/shallow";

import AddIcon from "/icons/addWhite.svg";
import FilterIcon from "/icons/filter.svg";
import MenuIcon from "/icons/menuIcon.svg";

import { getAllAssets } from "../../api/asset";
import { isMobile } from "../../common/common";
import Header from "../../components/Header";
import MobileNav from "../../components/Header/MobileNav";
import MobileModal from "../../components/MobileModal/MobileModal";
import assetsStatusFilter from "../../constants/assetsStatusFilter";
import assetTypes from "../../constants/assetTypes";
import { CONFIRMATION_MSG } from "../../constants/common";
import { useAssetStore } from "../../store/assetStore";
import AssetsForm from "./AssetForm";
import AssetItem from "./AssetItem";
import styles from "./assets.module.css";

const Assets = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const [statusValue, setStatusValue] = useAssetStore(
    (state) => [state.statusValue, state.setStatusValue],
    shallow,
  );
  const [assets, setAssets] = useAssetStore(
    (state) => [state.assets, state.setAssets, state.addAssets],
    shallow,
  );
  const [typeValue, setTypeValue] = useAssetStore(
    (state) => [state.typeValue, state.setTypeValue],
    shallow,
  );
  const [searchValue, setSearchValue] = useAssetStore(
    (state) => [state.searchValue, state.setSearchValue],
    shallow,
  );
  const [pagination, setPagination] = usePagination();

  const [footerHeight, setFooterHeight] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const footerRef = useRef();

  const navigate = useNavigate();

  const columns = [
    {
      header: "CB Sr#",
      accessorKey: "cbAssetId",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Model",
      accessorKey: "model",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Year of Mfg",
      accessorKey: "year",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Screen Size",
      accessorKey: "screensize",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
    {
      header: "Tagged to",
      accessorKey: "taggedTo",
      className: "col-xl-2",
      cell: (value) => (
        <Text size="b1" fontWeight="medium">
          {value.getValue() || "--"}
        </Text>
      ),
    },
  ];

  const fetchAssetsData = (searchQuery, status) => {
    const activeFilterQueryValue = status
      ? status.filter((filter) => filter.group === "Active").map((filter) => filter.value)
      : [];
    const closeFilterQueryValue = status
      ? status.filter((filter) => filter.group === "Closed").map((filter) => filter.value)
      : [];
    const archivedFilterValue = status
      ? status.find((filter) => filter.group === "Master")
      : null;
    setIsLoading(true);
    getAllAssets({
      search: searchQuery,
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      active_filter: activeFilterQueryValue.join(","),
      close_filter: closeFilterQueryValue.join(","),
      archived: archivedFilterValue ? archivedFilterValue.value : null,
    })
      .then((response) => {
        setAssets(response.assets);
        setPagination((state) => ({
          ...state,
          totalItems: response.count,
          pageCount: Math.ceil(response.count / pagination.pageSize),
        }));
      })
      .catch((errResponse) => toast.error(errResponse?.data?.detail))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (searchValue === undefined) return;
    const debouncedHandler = debounce(
      () => fetchAssetsData(searchValue, statusValue),
      500,
    );

    if (searchValue === "") {
      fetchAssetsData(searchValue, statusValue);
    } else {
      debouncedHandler();
    }

    return debouncedHandler.cancel;
  }, [searchValue, refetch, pagination.pageIndex, pagination.pageSize, statusValue]);

  useEffect(() => {
    setFooterHeight(footerRef?.current?.clientHeight);
  }, [statusValue]);

  const handleChange = (value) => {
    setStatusValue(value);
    fetchAssetsData(value);
  };

  return (
    <section
      className={styles.mainSection}
      style={{ height: `calc(100% - ${isMobile ? 80 : footerHeight}px)` }}
    >
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
              Assets
            </Heading>
          </div>
          <div className="flex justify-between" style={{ flexBasis: "10%" }}>
            <img
              src={FilterIcon}
              alt="filter clients"
              role="presentation"
              onClick={() => setShowFilterModal(true)}
            />
          </div>
        </Header>
      </header>
      <header className={`row no-gutters ${styles.header}`}>
        <Heading size="h4" fontWeight="bold" className="hidden-sm-down">
          Assets
        </Heading>
        <div
          className={`${!isMobile && "col-xl-3 ml-auto"} ${styles.addClientFloatingBtn}`}
        >
          <Button
            variant="primary"
            className={!isMobile && "ml-auto"}
            onClick={() => setIsAddAssetModalOpen(true)}
          >
            <img src={AddIcon} alt="add plus button" />
            <Text size="b2" fontWeight="semibold">
              Add New Asset
            </Text>
          </Button>
        </div>
      </header>
      <div className={`${isMobile ? "flex" : "row"} ${styles.actionsBox}`}>
        <div className={isMobile ? "col px-0" : "col-xl-4"}>
          <SearchInput
            placeholder="Search for Assets"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue("")}
            showCloseBtn
          />
        </div>
      </div>
      {isMobile ? (
        assets.map((asset) => <AssetItem asset={asset} key={asset.id} />)
      ) : (
        <Table
          columns={columns}
          tableData={assets}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          onRowClick={(e, rowData) => {
            e.preventDefault();
            if (rowData?.serialNum)
              navigate(`/assets/details/${encodeURIComponent(rowData.serialNum)}`);
          }}
          noDataMessage="No asset has been added yet"
        />
      )}
      <Modal
        title="Add New Asset"
        isOpen={isAddAssetModalOpen}
        onClose={() => {
          setIsAddAssetModalOpen(false);
          setRefetch(true);
        }}
        preventCloseOnOutsideClick
        showOnCloseAlert={formDirty}
        confirmation_msg={CONFIRMATION_MSG}
        isMobile={isMobile}
      >
        <AssetsForm
          onCancel={() => {
            if (formDirty) {
              if (window.confirm(CONFIRMATION_MSG)) setIsAddAssetModalOpen(false);
            } else {
              setIsAddAssetModalOpen(false);
            }
            setRefetch(true);
          }}
          onSubmit={() => {
            setIsAddAssetModalOpen(false);
            setRefetch(true);
          }}
          setFormDirty={setFormDirty}
        />
      </Modal>

      {isMobile && showFilterModal ? (
        <MobileModal title="Filter" onClose={() => setShowFilterModal(false)}>
          <div className={styles.filters}>
            <div className="col hide">
              <ReactSelect
                placeholder="Select Status"
                label="Status"
                options={assetsStatusFilter}
                isMulti
                hideSelectedOptions={false}
                closeMenuOnSelect={false}
                components={{
                  Option: CheckboxOption,
                }}
                value={statusValue}
                onChange={(value) => handleChange(value)}
              />
            </div>
            <div className="col mt-16">
              <ReactSelect
                placeholder="Select Asset Type"
                label="Asset Type"
                options={assetTypes}
                menuPlacement="top"
                isOptionDisabled={(option) => option.isdisabled}
                value={typeValue}
                onChange={setTypeValue}
              />
            </div>
          </div>
        </MobileModal>
      ) : (
        <div
          className={`flex align-center justify-end ${styles.assetFooter} hidden-sm-down`}
          ref={footerRef}
        >
          <div className="col-xl-4">
            <ReactSelect
              placeholder="Select Status"
              options={assetsStatusFilter}
              isMulti
              hideSelectedOptions={false}
              menuPlacement="top"
              closeMenuOnSelect={false}
              components={{
                Option: CheckboxOption,
              }}
              value={statusValue}
              onChange={(value) => handleChange(value)}
            />
          </div>
          <div className="col-xl-2 px-0">
            <ReactSelect
              placeholder="Select Asset Type"
              options={assetTypes}
              menuPlacement="top"
              isOptionDisabled={(option) => option.isdisabled}
              value={typeValue}
              onChange={setTypeValue}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Assets;
