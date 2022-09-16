import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback
} from "react";
import { useGraphContext } from "./graph-context";
import ReactFlow, {
  Controls,
  Background,
  useZoomPanHelper,
  isNode
} from "react-flow-renderer";
import { useLocation, useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import debounce from "lodash/debounce";

import Node from "./node";

const gridSize = 20;

const Graph = () => {
  const location = useLocation();
  const state = useGraphContext();
  const history = useHistory();
  const [transitionState, setTransitionState] = useState(null);
  const idOfNodeBeingConnectedRef = useRef(null);

  const { fitView, project } = useZoomPanHelper();

  const handleNodeDoubleClick = (evt, node) => {
    history.push(`${location.pathname}/${node.data.slug}`);
  };

  const handleNodeDragStop = (evt, node) => {
    state.updateTask(node.data, {
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y)
      }
    });
  };

  const handleConnectStart = (evt, { nodeId }) => {
    idOfNodeBeingConnectedRef.current = nodeId;
  };

  const getSlugPath = () =>
    location.pathname
      .split("/")
      .filter((slug) => slug)
      .slice(2);

  const visibleElements = useMemo(() => {
    const elements = getSlugPath().reduce((agg, slug) => {
      const selected = agg.find((n) => n.data?.slug === slug);
      return selected ? selected.data.subElements : agg;
    }, state.elements);

    return elements;
  }, [state.elements, location]);

  const handleConnect = useCallback(
    debounce(({ source, target, position }) => {
      if (target) {
        state.addDependency(target, source);
      } else {
        state.addTask(getSlugPath(), {
          name: getNewTaskName(),
          dependencies: [source],
          position
        });
      }
    }, 10),
    [state, location]
  );

  const getNewTaskName = () => {
    let name = "New task";
    let n = 1;
    while (visibleElements.some((e) => e.data?.name === name)) {
      name = `New task ${n++}`;
    }

    return name;
  };

  const handleConnectStop = (evt) => {
    const position = project({ x: evt.clientX, y: evt.clientY - 18 });
    handleConnect({
      source: idOfNodeBeingConnectedRef.current,
      target: null,
      position
    });
  };

  const handleEmptyStateCreateTaskClick = () => {
    setTransitionState("hide-zoom-in");
    state.addTask(getSlugPath(), { name: "New task" });
    setTimeout(fitView, 100);
    setTimeout(() => setTransitionState(null), 200);
  };

  const handleElementsRemove = (elements) => {
    const tasksAndDependencies = elements.map((e) =>
      isNode(e) ? e.data : { taskId: e.target, dependencyId: e.source }
    );
    state.deleteTasksAndDependencies(tasksAndDependencies);
  };

  useEffect(() => {
    setTransitionState("hide-zoom-in");
    setTimeout(fitView, 5);
    setTimeout(() => setTransitionState(null), 200);
  }, [fitView, location]);

  return (
    <div style={{ height: window.innerHeight }}>
      <ReactFlow
        elements={visibleElements}
        nodeTypes={{ default: Node }}
        nodesDraggable={state.isEditing}
        onElementsRemove={handleElementsRemove}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectStop={handleConnectStop}
        onLoad={(flow) => flow.fitView()}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeDragStop={handleNodeDragStop}
        zoomOnScroll={true}
        snapToGrid={true}
        snapGrid={[gridSize, gridSize]}
        className={transitionState}
      >
        <Controls showInteractive={false} />
        {visibleElements.length === 0 && (
          <Button
            size="large"
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleEmptyStateCreateTaskClick}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translateX(-50%)",
              zIndex: 5
            }}
          >
            Create task
          </Button>
        )}

        {state.isEditing && <Background gap={gridSize} />}
      </ReactFlow>
    </div>
  );
};

export default Graph;
