import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";

import "./styles.css";
import ProjectDetails from "./project-details";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/project/:projectId">
          <ProjectDetails />
        </Route>

        <Redirect exact from="/" to="/project/curation" />
        <Redirect exact from="/project" to="/project/curation" />
      </Switch>
    </Router>
  );
}
