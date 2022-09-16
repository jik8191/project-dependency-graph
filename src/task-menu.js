import React, { useCallback, useContext, useState } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import { getStatusColor } from "./node";
import { useGraphContext } from "./graph-context";
import TaskDialog from "./task-dialog";

const TaskMenu = (props) => {
  const { task, position, onClose } = props;
  const state = useGraphContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(
    task.id === state.newTaskId
  );

  const handleStatusSelect = useCallback(
    (status) => {
      state.updateTask(task, { status });
      onClose();
    },
    [state, onClose, task]
  );

  const handleDeleteSelect = useCallback(() => {
    state.deleteTask(task);
    onClose();
  }, [state]);

  const handleEditSelect = useCallback(() => {
    setIsEditDialogOpen(true);
    onClose();
  }, []);

  return (
    <>
      <Menu
        keepMounted
        open={!!position}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={
          position &&
          (position.y !== null && position.x !== null
            ? { top: position.y, left: position.x }
            : undefined)
        }
      >
        <MenuItem onClick={handleEditSelect}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>

        <Divider />

        <StatusMenuItem status="done" onClick={handleStatusSelect} />
        <StatusMenuItem status="in-progress" onClick={handleStatusSelect} />
        <StatusMenuItem status="not-started" onClick={handleStatusSelect} />

        <Divider />

        <MenuItem onClick={handleDeleteSelect}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <TaskDialog
        task={task}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};

export const statusNames = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done"
};

const StatusMenuItem = ({ status, onClick }) => {
  return (
    <MenuItem onClick={() => onClick(status)}>
      <ListItemIcon>
        <StatusSwatch status={status} />
      </ListItemIcon>
      {statusNames[status]}
    </MenuItem>
  );
};

export const StatusSwatch = ({ status }) => {
  const color = getStatusColor(status);
  return (
    <div
      style={{
        width: 20,
        height: 20,
        marginRight: 8,
        borderRadius: "50%",
        backgroundColor: color ?? "white",
        border: color ? "1px solid transparent" : "1px solid black"
      }}
    />
  );
};

export default TaskMenu;
