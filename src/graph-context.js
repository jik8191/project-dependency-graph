import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef
} from "react";
import * as data from "./data";
import * as flow from "react-flow-renderer";
import { v4 as uuid } from "uuid";

const initialState = {
  isEditing: true,
  elements: [],
  visibleElements: [],
  projectId: null,
  project: null,
  newTaskId: null,
  slugPath: null
};

const GraphContext = createContext(initialState);

export const GraphContextProvider = ({ children }) => {
  const [state, updateState] = useState(initialState);
  const projectDocRef = useRef();

  useEffect(() => {
    if (!state.projectId) return;

    const projectDoc = data.getProject(state.projectId);
    projectDocRef.current = projectDoc;

    const unsubscribe = projectDoc.onSnapshot((projectSnapshot) => {
      // if (projectSnapshot.metadata.hasPendingWrites) return;
      const project = projectSnapshot.exists ? projectSnapshot.data() : null;
      setProject({ tasks: [], ...project, id: state.projectId });
      // const elements = project ? data.getElementsForTasks(backup.tasks) : [];

      // const mapTasks = (tasks) => {
      //   return tasks.map(({ done, ...task }, i) => ({
      //     ...task,
      //     subTasks: mapTasks(task.subTasks),
      //     dependencies: task.dependencies.reduce((agg, name) => {
      //       const dep = tasks.find((t) => t.name === name || t.id === name);
      //       if (dep) agg.push(dep.id);
      //       return agg;
      //     }, [])
      //   }));
      // };
      // projectDocRef.current.update({ tasks: mapTasks(project.tasks) });
      // console.log("tasks", mapTasks(project.tasks));
      // console.log(JSON.stringify(project, null, 2));

      const elements = data.getElementsForTasks(project.tasks ?? []);
      setElements(elements);
    });

    return unsubscribe;
  }, [state.projectId]);

  const setProjectId = (projectId) =>
    updateState((state) => ({ ...state, projectId }));

  const setProject = (project) =>
    updateState((state) => ({ ...state, project }));

  const setSlugPath = (slugPath) =>
    updateState((state) => ({ ...state, slugPath }));

  const setIsEditing = (isEditing) => updateState({ ...state, isEditing });

  const toggleIsEditing = () => setIsEditing(!state.isEditing);

  const setElements = (elements) => {
    updateState((state) => ({
      ...state,
      elements: elements
    }));
  };

  const deleteTaskUtil = (taskToDelete, allTasks) => {
    return allTasks.reduce((agg, t) => {
      if (t.id !== taskToDelete.id)
        agg.push({
          ...t,
          subTasks: deleteTaskUtil(taskToDelete, t.subTasks),
          dependencies: t.dependencies.filter((d) => d !== taskToDelete.id)
        });
      return agg;
    }, []);
  };

  const deleteTask = (taskToDelete) => {
    const updatedTasks = deleteTaskUtil(taskToDelete, state.project.tasks);
    projectDocRef.current.update({ tasks: updatedTasks });
  };

  const addTask = (slugPath, task) => {
    const newTask = {
      id: uuid(),
      slug: data.getSlugForName(task.name),
      dependencies: [],
      subTasks: [],
      status: "not-started",
      position: { x: 0, y: 0 },
      ...task
    };

    const updatedTasks = addTaskUtil(slugPath, newTask, state.project.tasks);
    projectDocRef.current.update({ tasks: updatedTasks });
    updateState((state) => ({ ...state, newTaskId: newTask.id }));
  };

  const addTaskUtil = (slugPath, task, allTasks) => {
    if (slugPath.length === 0)
      return [...allTasks, { ...task, number: allTasks.length + 1 }];

    return allTasks.map((t) => {
      return t.slug !== slugPath[0]
        ? t
        : {
            ...t,
            subTasks: addTaskUtil(slugPath.slice(1), task, t.subTasks)
          };
    });
  };

  const addDependencyUtil = (taskId, dependencyId, allTasks) => {
    let done = false;
    return allTasks.map((t) => {
      if (done) return t;

      if (t.id === taskId) {
        done = true;
        return { ...t, dependencies: [...t.dependencies, dependencyId] };
      }
      return {
        ...t,
        subTasks: addDependencyUtil(taskId, dependencyId, t.subTasks)
      };
    });
  };

  const addDependency = (taskId, dependencyId) => {
    const updatedTasks = addDependencyUtil(
      taskId,
      dependencyId,
      state.project.tasks
    );
    projectDocRef.current.update({ tasks: updatedTasks });
  };

  const updateTaskUtil = (taskToUpdate, updates, allTasks) => {
    let done = false;

    return allTasks.map((t) => {
      if (t.id === taskToUpdate.id) {
        done = true;
        return { ...t, ...updates };
      }
      if (done) return t;

      return {
        ...t,
        subTasks: updateTaskUtil(taskToUpdate, updates, t.subTasks)
      };
    });
  };

  const updateTask = (taskToUpdate, updates) => {
    const updatedTasks = updateTaskUtil(
      taskToUpdate,
      updates,
      state.project.tasks
    );
    projectDocRef.current.update({ tasks: updatedTasks });

    if (taskToUpdate.id === state.newTaskId) {
      updateState((state) => ({ ...state, newTaskSlug: null }));
    }
  };

  const deleteTasksAndDependencies = (tasksAndDependencies) => {
    let updatedTasks = tasksAndDependencies.reduce((agg, taskOrDep) => {
      const isTask = "slug" in taskOrDep;
      return isTask
        ? deleteTaskUtil(taskOrDep, agg)
        : deleteDependencyUtil(taskOrDep.taskId, taskOrDep.dependencyId, agg);
    }, state.project.tasks);

    projectDocRef.current.update({ tasks: updatedTasks });
  };

  const deleteDependencyUtil = (
    taskId,
    dependencyId,
    allTasks,
    ref = { isDone: false }
  ) => {
    if (ref.isDone) return allTasks;

    return allTasks.map((t) => {
      if (ref.isDone) return t;

      if (t.id === taskId) {
        ref.isDone = true;
        return {
          ...t,
          dependencies: t.dependencies.filter((d) => d !== dependencyId)
        };
      }

      return {
        ...t,
        subTasks: deleteDependencyUtil(taskId, dependencyId, t.subTasks, ref)
      };
    });
  };

  const visibleTasks = useMemo(() => {
    if (!state.project || !state.slugPath) return [];

    return state.slugPath.reduce((tasks, slug) => {
      return tasks.find((t) => t.slug === slug)?.subTasks ?? [];
    }, state.project.tasks);
  }, [state.project, state.slugPath]);

  const currentState = useMemo(
    () => ({
      ...state,
      visibleTasks,
      setIsEditing,
      toggleIsEditing,
      addTask,
      setElements,
      setProjectId,
      setProject,
      setSlugPath,
      updateTask,
      deleteTask,
      addDependency,
      deleteTasksAndDependencies
    }),
    [state, visibleTasks] // eslint-disable-line
  );

  return (
    <GraphContext.Provider
      children={children}
      value={currentState}
    ></GraphContext.Provider>
  );
};

export const useGraphContext = () => useContext(GraphContext);

export default GraphContext;
