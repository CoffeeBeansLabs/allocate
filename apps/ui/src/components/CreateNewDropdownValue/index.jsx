import { Button, Divider, Input } from "@allocate-core/ui-components";
import React, { useState } from "react";
import { components } from "react-select";
import { toast } from "react-toastify";

import AddBlue from "/icons/addBlue.svg";
import AddWhite from "/icons/addWhite.svg";

import { postAssetBrand, postAssetModel, postAssetType } from "../../api/asset";
import { createRole } from "../../api/projects";

const CreateNewDropdownValue = ({ selectProps, ...props }) => {
  const [isAddButtonOpen, setIsAddButtonOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const { onMenuInputFocus, onMenuInputBlur, name } = selectProps;

  const getApiFunction = () => {
    if (name === "type") return postAssetType;
    if (name === "model") return postAssetModel;
    if (name === "brand") return postAssetBrand;
    return createRole;
  };

  const handleAdd = () => {
    const apifunction = getApiFunction();
    apifunction({ name: newValue })
      .then(() => toast.success(`${name} created`))
      .catch((errResponse) => toast.error(errResponse?.data.detail))
      .finally(onMenuInputBlur);
  };

  return (
    <components.MenuList {...props}>
      <Button
        variant="secondary"
        onClick={(e) => {
          e.preventDefault();
          setIsAddButtonOpen((prevState) => !prevState);
        }}
      >
        <img src={AddBlue} alt="blue add button (plus)" />
        Create {name}
      </Button>
      <div className={isAddButtonOpen ? "show" : "hide"}>
        <div className={`flex align-items-end gap-10 pt-16`}>
          <div className="col-xl-9 px-0">
            <Input
              placeholder={`${name} name`}
              value={newValue}
              onChange={(e) => {
                e.stopPropagation();
                setNewValue(e.target.value);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.target.focus();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                e.target.focus();
              }}
              onFocus={onMenuInputFocus}
            />
          </div>
          <Button variant="primary" onClick={handleAdd}>
            <img
              src={AddWhite}
              alt="white add button (plus)"
              style={{
                height: "18px",
                width: "18px",
              }}
            />
          </Button>
        </div>
      </div>
      <Divider />

      {props.children}
    </components.MenuList>
  );
};

export default CreateNewDropdownValue;
