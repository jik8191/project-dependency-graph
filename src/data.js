import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA71ju9DomK7jzA0cEsDlSXnS4aRVVjE-I",
  authDomain: "project-dependency-graph.firebaseapp.com",
  projectId: "project-dependency-graph",
  storageBucket: "project-dependency-graph.appspot.com",
  messagingSenderId: "384624490966",
  appId: "1:384624490966:web:a9fd96953bb370f97d4c77",
  measurementId: "G-EXZ58RG6RF"
};

if (!window.firebaseInitialized) {
  firebase.initializeApp(firebaseConfig);
  window.firebaseInitialized = true;
}

const db = firebase.firestore();

const getLongestPath = (task, allTasks, seen = new Set()) => {
  if (seen.has(task.name)) return [];

  seen.add(task.name);
  const dependents = allTasks.filter((t) => t.dependencies?.includes(task.id));

  if (dependents.length === 0) return [task];

  const longestPathsFromDependents = dependents.map((t) =>
    getLongestPath(t, allTasks)
  );
  const longest = longestPathsFromDependents.reduce((longest, p) => {
    return pathDuration(longest) >= pathDuration(p) ? longest : p;
  }, longestPathsFromDependents[0]);

  return [task, ...longest];
};

const pathDuration = (p) => p.reduce((agg, t) => agg + (t.days || 0), 0);

const mapTaskToNode = (t, i, criticalPathTasks) => {
  const subElements = getElementsForTasks(t.subTasks);
  return {
    id: t.id || Math.random().toString(),
    data: {
      ...t,
      subElements
    },
    position: t.position ?? { x: 0, y: 0 },
    style: { borderWidth: criticalPathTasks.includes(t.id) ? 2 : 1 }
  };
};

const getEdgesForTasks = (tasks, criticalPathTasks) => {
  return tasks.reduce((agg, t) => {
    agg.push(
      ...(t.dependencies ?? []).map((d) => {
        const isCriticalPath =
          criticalPathTasks.includes(t.id) && criticalPathTasks.includes(d);
        return {
          id: `${t.id}-${d}`,
          source: d,
          target: t.id,
          arrowHeadType: "arrowclosed",
          className: isCriticalPath ? "critical-path" : null
        };
      })
    );
    return agg;
  }, []);
};

export function getElementsForTasks(tasks) {
  if (!tasks?.length) return [];

  const criticalPathTasks = getLongestPath(tasks[0], tasks).map((t) => t.id);

  return tasks
    .map((t, i) => mapTaskToNode(t, i, criticalPathTasks))
    .concat(getEdgesForTasks(tasks, criticalPathTasks));
}

export function getProject(projectId) {
  return db.collection("projects").doc(projectId);
}

export const getSlugForName = (name) =>
  name.toLowerCase().replace(/[^\w]+/g, "-");
