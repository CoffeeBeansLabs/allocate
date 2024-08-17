import { Button, Input, Modal, Table, Text } from "@allocate-core/ui-components";
import { formatISO } from "date-fns";
import _, { debounce } from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import BinIcon from "../../../../public/icons/binIcon.svg";
import { makeTalentChanges, requestTalentChanges } from "../../../api/projects";
import { isMobile } from "../../../common/common";
import MobileModal from "../../../components/MobileModal/MobileModal";
import PermissionGate, { getPermission } from "../../../components/PermissionGate";
import { SCOPES } from "../../../constants/roles";
import styles from "./components.module.css";
import PositionCriteria from "./PositionCriteria";

const ManageTalentModal = ({ isOpen, data, onClose, onRemove, criteria }) => {
  const [talentList, setTalentList] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState([]);
  const canRequest = getPermission([SCOPES.canRequestTalent]);

  useEffect(() => {
    setTalentList(_.cloneDeep(data));
    setIsFormDirty(Array(data.length).fill(false));
  }, [data]);

  const handleSubmit = async (event, values) => {
    event.preventDefault();
    const { allocationId, allocation, allocationTill } = values;
    if (!allocation || !allocationTill) {
      toast.error("Both fields required");
      return;
    }
    const payload = {
      utilization: Number(allocation),
      endDate: allocationTill,
      user: canRequest ? undefined : values.id,
    };
    try {
      await (canRequest
        ? requestTalentChanges(allocationId, payload)
        : makeTalentChanges(allocationId, payload));
      toast.success(
        canRequest ? "Allocation details change requested" : "Allocation details updated",
      );
      onClose();
    } catch (error) {
      toast.error(error?.data?.detail || error?.data?.nonFieldErrors?.[0]);
    }
  };

  const handleChange = (allocationId, field, updatedField) => {
    setTalentList((prev) => {
      const list = [...prev];
      const fieldToChange = list.find((talent) => talent.allocationId === allocationId);
      fieldToChange[field] = updatedField;
      return list;
    });
  };

  const handleSetFormDirty = (rowIndex) => {
    setIsFormDirty((prev) => {
      prev[rowIndex] = !_.isEqual(data[rowIndex], talentList[rowIndex]);
      return [...prev];
    });
  };

  const getButtonText = () => (canRequest ? "Request changes" : "Make Changes");

  const columns = [
    {
      id: 1,
      header: "Talent Name",
      accessorKey: "name",
      className: "col-xl-3",
      cell: (value) => {
        return (
          <Text size="b1" fontWeight="medium">
            {value.getValue()}
          </Text>
        );
      },
    },
    {
      id: 2,
      header: "Allocation",
      accessorKey: "allocation",
      className: "col-xl-2",
      cell: ({ row }) => {
        return (
          <Cell
            row={row}
            handleChange={handleChange}
            handleSetFormDirty={handleSetFormDirty}
          />
        );
      },
    },
    {
      id: 3,
      header: "Allocation till",
      accessorKey: "allocationTill",
      className: "col-xl-3",
      cell: ({ row }) => {
        const handleDateChange = (value) => {
          const changedValue = formatISO(new Date(value), { representation: "date" });
          handleChange(row.original.allocationId, "allocationTill", changedValue);
          handleSetFormDirty(row.index);
        };

        return (
          <Input
            required
            value={new Date(row.original.allocationTill)}
            variant="date"
            calendarPosition="right-center"
            minDate={new Date(row.original.allocationFrom)}
            maxDate={new Date(row.original.positionTill)}
            onChange={(value) => handleDateChange(value)}
          />
        );
      },
    },
    {
      id: 4,
      header: "Action",
      accessorKey: "id",
      className: "col-xl-3",
      cell: ({ row }) => {
        return (
          <Button
            variant="secondary"
            onClick={(e) => handleSubmit(e, row.original)}
            disabled={!isFormDirty[row.index]}
          >
            <Text size="b1" fontWeight="medium">
              {getButtonText()}
            </Text>
          </Button>
        );
      },
    },
    {
      id: 5,
      header: "",
      accessorKey: "id",
      className: "col-xl-1",
      cell: (value) => {
        return (
          <PermissionGate
            scopes={[SCOPES.canRemoveTalent]}
            permittedElement={() => (
              <input
                type="image"
                src={BinIcon}
                alt="Remove talent from allocation"
                onClick={(e) => onRemove(e, value.row.original)}
                onKeyDown={(e) => onRemove(e, value.row.original)}
                tabIndex={0}
              />
            )}
          />
        );
      },
    },
  ];

  const renderMobileContent = () => {
    return (
      <MobileModal
        isFullScreen={false}
        showTitle={true}
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Talents"
      >
        <div className="col">
          <PositionCriteria criteria={criteria} />
        </div>

        {talentList.map((talent, idx) => {
          return (
            <div className="flex-col mt-16" key={idx}>
              <div className="col-xl-12 flex-col">
                <Text size="b2" fontWeight="medium">
                  Talent Name
                </Text>
                <Text size="b2" fontWeight="regular">
                  {talent?.name}
                </Text>
              </div>
              <div className="col-xl-12 mt-16">
                <Input
                  required
                  label="Allocation Till"
                  value={new Date(talent?.allocationTill)}
                  variant="date"
                  minDate={new Date(talent?.allocationFrom)}
                  maxDate={new Date(talent?.positionTill)}
                  onChange={(value) => {
                    handleChange(
                      talent.allocationId,
                      "allocationTill",
                      formatISO(new Date(value), { representation: "date" }),
                    );
                    handleSetFormDirty(idx);
                  }}
                />
              </div>
              <div className="col-xl-12 mt-16">
                <Input
                  required
                  label="Allocation"
                  type="number"
                  placeholder="Select utilization"
                  value={talentList?.[idx]?.allocation}
                  onChange={(e) => {
                    handleChange(talent.allocationId, "allocation", e.target.value);
                    handleSetFormDirty(idx);
                  }}
                />
              </div>
              <div className="col-xl-12 flex gap-20 py-20">
                <PermissionGate
                  scopes={[SCOPES.canRemoveTalent]}
                  showPermittedElement
                  permittedElement={(hasPermission) => (
                    <Button
                      variant="secondary"
                      onClick={(e) => onRemove(e, talent)}
                      className="ml-auto"
                      disabled={!hasPermission}
                    >
                      <Text size="b2" fontWeight="medium">
                        Remove
                      </Text>
                    </Button>
                  )}
                />

                <Button
                  variant="primary"
                  onClick={(e) => handleSubmit(e, talent)}
                  disabled={!isFormDirty[idx]}
                >
                  <Text size="b2" fontWeight="medium">
                    {getButtonText()}
                  </Text>
                </Button>
              </div>
            </div>
          );
        })}
      </MobileModal>
    );
  };

  const renderDesktopContent = () => {
    return (
      <Modal
        size="lg"
        title="Manage Talents"
        isOpen={isOpen}
        onClose={onClose}
        preventCloseOnOutsideClick={true}
        isMobile={isMobile}
      >
        <div className={styles.manageTable}>
          <Table
            columns={columns}
            tableData={talentList}
            hidePagination
            onRowClick={() => {}}
          />
        </div>
      </Modal>
    );
  };

  return isMobile ? renderMobileContent() : renderDesktopContent();
};

export default ManageTalentModal;

ManageTalentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      allocation: PropTypes.number.isRequired,
      allocationFrom: PropTypes.string.isRequired,
      allocationId: PropTypes.number.isRequired,
      allocationTill: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      positionTill: PropTypes.string.isRequired,
    }),
  ),
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  criteria: isMobile ? PropTypes.object.isRequired : PropTypes.undefined,
};

const Cell = ({ row, handleChange, handleSetFormDirty }) => {
  const [localAllocation, setLocalAllocation] = React.useState(row.original.allocation);
  const debouncedHandleChangeRef = useRef(null);

  if (!debouncedHandleChangeRef.current) {
    debouncedHandleChangeRef.current = debounce((allocationId, field, value, index) => {
      handleChange(allocationId, field, value);
      handleSetFormDirty(index);
    }, 1000);
  }

  const handleAllocationChange = useCallback(
    (e) => {
      const changedValue = parseInt(e.target.value);
      setLocalAllocation(changedValue);

      if (changedValue !== row.original.allocation) {
        debouncedHandleChangeRef.current(
          row.original.allocationId,
          "allocation",
          changedValue,
          row.index,
        );
      } else {
        handleSetFormDirty(row.index);
      }
    },
    [row.original.allocation, row.original.allocationId, row.index, handleSetFormDirty],
  );

  useEffect(() => {
    return () => {
      if (debouncedHandleChangeRef.current) {
        debouncedHandleChangeRef.current.cancel();
      }
    };
  }, []);

  return (
    <Input
      required
      type="number"
      placeholder="Select utilization"
      value={localAllocation || ""}
      onChange={handleAllocationChange}
    />
  );
};

Cell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      allocation: PropTypes.number.isRequired,
      allocationId: PropTypes.number.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSetFormDirty: PropTypes.func.isRequired,
};
