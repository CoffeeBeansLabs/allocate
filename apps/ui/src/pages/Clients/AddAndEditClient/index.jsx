import { Button, Input, Select, Text } from "@allocate-core/ui-components";
import PropTypes from "prop-types";
import React, { useState } from "react";

import styles from "./clientForm.module.css";

const AddAndEditClient = ({ type }) => {
  const [showFormSubSection, toggleFormSubSection] = useState(false);

  const CTATitle = type === "edit" ? "Save changes" : "Add client";

  return (
    <div className={styles.clientsForm}>
      <div className="">
        <div className="row">
          <div className="col-xl-12">
            <Input label="Client Name" placeholder="Enter here" />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 pt-20">
            <Select label="Domain (Industry)" placeholder="Select the domain" />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-6 pt-20">
            <Select label="Country" placeholder="Select country" />
          </div>
          <div className="col-xl-6 pt-20">
            <Select label="City" placeholder="Select city" />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 pt-20">
            <Select label="Status" placeholder="Dormant" />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 pt-20">
            <Select label="Start Date" placeholder="17 November 2022" />
          </div>
        </div>
        <div className="row pt-20 justify-content-between">
          <div className="col-xl-4 pl-0">
            {type === "edit" ? null : (
              <Button
                type="tertiary"
                onClick={() => {
                  toggleFormSubSection((value) => !value);
                }}
              >
                Add more details
              </Button>
            )}
          </div>
          <div
            className={`col-xl-12 px-0 ${styles.additionalDetails} ${
              showFormSubSection || type === "edit" ? "show" : "hide"
            }`}
          >
            <div className={`col-xl-12 bg-CadetGrey-op-10 ${styles.formSubSectionCard}`}>
              <div className="row no-gutters">
                <Text size="b1" fontWeight="bold">
                  Point of contact 1
                </Text>
                <Text size="b1">&nbsp; (Optional)</Text>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Name" placeholder="Enter name" />
                </div>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Email" placeholder="Ex: xyz@gmail.com" />
                </div>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Phone Number" placeholder="Enter phone number" />
                </div>
              </div>
            </div>
            <div className={`col-xl-12 bg-CadetGrey-op-10 ${styles.formSubSectionCard}`}>
              <div className="row no-gutters">
                <Text size="b1" fontWeight="bold">
                  Point of contact 2
                </Text>
                <Text size="b1">&nbsp; (Optional)</Text>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Name" placeholder="Enter name" />
                </div>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Email" placeholder="Ex: xyz@gmail.com" />
                </div>
              </div>
              <div className="row pt-20">
                <div className="col">
                  <Input label="Phone Number" placeholder="Enter phone number" />
                </div>
              </div>
            </div>
            <div className={`col-xl-12 bg-CadetGrey-op-10 ${styles.formSubSectionCard}`}>
              <div className="row no-gutters">
                <Text size="b1" fontWeight="bold">
                  Other details
                </Text>
              </div>
              <div className="row pt-20">
                <div className="col-xl-12">
                  <Select
                    label="Account Manager (Optional)"
                    placeholder="Select account manager"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 ml-auto">
            <Button className="ml-auto" type="primary">
              {CTATitle}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddAndEditClient.propTypes = {
  type: PropTypes.oneOf(["add", "edit"]),
};

export default AddAndEditClient;
