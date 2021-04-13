import React, { lazy } from "react";
import { Switch, Route } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";

const RoomComponent = lazy(() => import("./components/ChatRoom"));
const HomeComponent = lazy(() => import("./components/Home"));

const Routes = () => {
  return (
    <React.Suspense
      fallback={<CircularProgress className="module-loader" size={44} />}
    >
      <Switch>
        <Route path="/chat" component={RoomComponent} />
        <Route path="/" component={HomeComponent} />
      </Switch>
    </React.Suspense>
  );
};

export default Routes;
