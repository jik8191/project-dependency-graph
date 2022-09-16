import React, { useState, useMemo, useRef, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import { useGraphContext } from "./graph-context";
import { getSlugForName } from "./data";

const TaskDialog = ({ isOpen, onClose, task }) => {
  const state = useGraphContext();
  const [taskUpdates, setTaskUpdates] = useState({});
  const isCreating = state.newTaskId === task.id;
  const nameFieldRef = useRef();

  useEffect(() => {
    if (isOpen && nameFieldRef.current) {
      setTimeout(() => {
        nameFieldRef.current.focus();
        nameFieldRef.current.select && nameFieldRef.current.select();
      }, 100);
    }
  }, [isOpen]);

  const handleFieldChange = (evt) => {
    const { id, value } = evt.target;
    setTaskUpdates({
      ...taskUpdates,
      [id]: value,
      ...(id === "name"
        ? { name: value.trim(), slug: getSlugForName(value) }
        : {})
    });
  };

  const handleSubmit = (evt) => {
    state.updateTask(task, taskUpdates);
    onClose();
    evt.preventDefault();
  };

  const handleCancel = () => {
    if (isCreating) state.deleteTask(task);

    onClose();
  };

  const handleKeyDown = (evt) => {
    if (evt.key === "Enter") {
      handleSubmit(evt);
    } else if (evt.key === "Escape") {
      handleCancel();
    }
  };

  const subtaskDaySum = useMemo(
    () =>
      task.subTasks.reduce(
        (sum, task) => sum + (parseInt(task.days, 10) || 0),
        0
      ),
    [task]
  );

  const isNameDuplicate =
    taskUpdates.name &&
    state.visibleTasks.some(
      (t) => t.id !== task.id && t.name === taskUpdates.name
    );

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onDoubleClick={(evt) => evt.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>{isCreating ? "Create task" : "Update task"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <TextField
              id="name"
              label="Name"
              inputRef={nameFieldRef}
              defaultValue={task.name}
              fullWidth
              onChange={handleFieldChange}
              autoFocus
              error={isNameDuplicate}
              helperText={isNameDuplicate && "Name already in use"}
              autoComplete="off"
            />
          </div>
          <div className="form-row">
            <TextField
              id="days"
              label="Days"
              defaultValue={task.days}
              type="number"
              min={0}
              onChange={handleFieldChange}
              helperText={
                (subtaskDaySum && `Subtasks: ${subtaskDaySum} days`) || ""
              }
            />
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={isNameDuplicate}
        >
          {isCreating ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
