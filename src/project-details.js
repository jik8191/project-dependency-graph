import "./styles.css";
import Graph from "./graph";
import React, { useEffect, useMemo } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { useGraphContext } from "./graph-context";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const state = useGraphContext(projectId);
  const location = useLocation();

  useEffect(() => {
    state.setProjectId(projectId);
  }, [projectId]);

  useEffect(() => {
    const slugPath = location.pathname
      .split("/")
      .filter((p) => p)
      .slice(2);

    state.setSlugPath(slugPath);
  }, [location]);

  const pathTasks = useMemo(
    () =>
      !state.project || !state.slugPath
        ? []
        : state.slugPath.reduce((agg, slug, i) => {
            const parentTasks = agg[i - 1]?.subTasks ?? state.project.tasks;
            const task = parentTasks.find((t) => t.slug === slug);
            if (task) agg.push(task);
            return agg;
          }, []),
    [state, location]
  );

  if (!state.project) return null;

  document.title = `${state.project.name} dependency graph`;

  return (
    <div>
      <Breadcrumbs>
        {state.project && (
          <BreadcrumbLink
            to={`/project/${state.project.id}`}
            color={pathTasks.length === 0 ? "textPrimary" : "inherit"}
          >
            {state.project.name}
          </BreadcrumbLink>
        )}
        {pathTasks.map((task, i) => (
          <BreadcrumbLink
            to={`/project/${state.project.id}/${pathTasks
              .slice(0, i + 1)
              .map((t) => t.slug)
              .join("/")}`}
            color={(i === pathTasks.length - 1) > 0 ? "textPrimary" : "inherit"}
            key={task.id}
          >
            {task.name}
          </BreadcrumbLink>
        ))}
      </Breadcrumbs>

      <Graph />
    </div>
  );
};

const BreadcrumbLink = (props) => <Link {...props} component={RouterLink} />;

export default ProjectDetails;
