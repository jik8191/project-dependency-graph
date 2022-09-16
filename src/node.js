import React, { useContext, useState } from "react";
import { Handle } from "react-flow-renderer";

import TaskMenu from "./task-menu";
import graphContext from "./graph-context";

const CustomNodeComponent = ({ data }) => {
  const state = useContext(graphContext);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(
    state.newTaskId === data.id
  );
  const handleStyle = state.isEditing ? {} : { visibility: "hidden" };
  const [contextMenuPos, setContextMenuPos] = useState(null);

  const handleContextMenu = (evt) => {
    evt.preventDefault();
    setContextMenuPos({ x: evt.clientX, y: evt.clientY });
  };

  const handleContextMenuClose = () => setContextMenuPos(null);

  const metadata = [];
  if (data.subTasks?.length) metadata.push(`${data.subTasks.length} subtasks`);
  if (data.days) metadata.push(`${data.days} days`);

  return (
    <div
      className="node"
      style={{ background: getStatusColor(data.status) }}
      onContextMenu={handleContextMenu}
    >
      <Handle type="target" position="left" style={handleStyle} />
      <div onClick={() => setIsEditDialogOpen(!isEditDialogOpen)}>
        <div style={{ display: "flex", textAlign: "left" }}>
          <span>{data.number}</span>
          <span style={{ opacity: 0.25, margin: "0 4px" }}> | </span>
          <div>
            <span className="name">{data.name}</span>
            <div className="duration">{metadata.join(" | ")}</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ ...handleStyle, top: "50%" }}
      />

      <TaskMenu
        task={data}
        position={contextMenuPos}
        onClose={handleContextMenuClose}
      />
    </div>
  );
};

const statusColors = {
  done: "#a9d65b",
  "in-progress": "#6cc2f7"
};

export const getStatusColor = (status) => {
  return statusColors[status] ?? null;
};

export default CustomNodeComponent;
