import dagre from "dagre";
import { isNode } from "react-flow-renderer";

const nodeWidth = 172;
const nodeHeight = 50;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (elements) => {
  dagreGraph.setGraph({ rankdir: "LR" });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el) && !el.position) {
      const nodeWithPosition = dagreGraph.node(el.id);
      // const targetPosition = "left";
      // const sourcePosition = "right";

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      const position = {
        x: Math.round(
          nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000
        ),
        y: Math.round(nodeWithPosition.y - nodeHeight / 2)
      };

      return {
        ...el,
        targetPosition: "left",
        sourcePosition: "right",
        position
      };
    }

    return el;
  });
};
