import { Text } from "@allocate-core/ui-components";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ChevronIcon from "/icons/chevron.svg";

import styles from "./assets.module.css";

const AssetItem = ({ asset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={styles.assetItem}>
      <div className={`flex gap-20 ${styles.assetSecondInfo}`}>
        <div
          className="flex gap-10"
          role="presentation"
          onClick={() => navigate(`/assets/details/${asset?.id}`)}
        >
          <Text size="b1" fontWeight="semibold">
            CB Sr#:
          </Text>
          <Text size="b1" fontWeight="medium">
            {asset?.srNo}
          </Text>
        </div>
        <img
          src={ChevronIcon}
          alt="chevron icon"
          role="presentation"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {isOpen ? (
        <div>
          <div className={`flex gap-10 ${styles.assetFirstInfo}`}>
            <Text size="b2" fontWeight="semibold">
              Model:
            </Text>
            <Text size="b2" fontWeight="medium">
              {asset?.model}
            </Text>
          </div>
          <div className={`flex gap-10 ${styles.assetSecondInfo}`}>
            <Text size="b2" fontWeight="semibold">
              Type:
            </Text>
            <Text size="b2" fontWeight="medium">
              {asset?.type}
            </Text>
          </div>
          <div className={`flex gap-10 ${styles.assetFirstInfo}`}>
            <Text size="b2" fontWeight="semibold">
              Year of Mfg:
            </Text>
            <Text size="b2" fontWeight="medium">
              {asset?.srNo}
            </Text>
          </div>
          <div className={`flex gap-10 ${styles.assetSecondInfo}`}>
            <Text size="b2" fontWeight="semibold">
              Screen Size:
            </Text>
            <Text size="b2" fontWeight="medium">
              {asset?.screenSize}
            </Text>
          </div>
          <div className={`flex gap-10 ${styles.assetFirstInfo}`}>
            <Text size="b2" fontWeight="semibold">
              Tagged to:
            </Text>
            <Text size="b2" fontWeight="medium">
              {asset?.srNo}
            </Text>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AssetItem;
