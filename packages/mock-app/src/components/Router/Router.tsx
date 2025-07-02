import React, { Fragment } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import appConfig from '../../constants/app-config.json';
import { Home, Scanning, Verify, Application, GenericPage, InteractiveVCMap } from '../../pages';
import { convertStringToPath } from '../../utils';
import { IFeature } from '../../types/common.types';
import { useEffect } from 'react';

const renderRoutes = (app: any) => {
  // Return none if app is not enabled
  if (app.enabled && !app.enabled) return [];
  const mainPath = `/${convertStringToPath(app.name)}`;
  const mainElement = <Application app={app} />;

  // Generate child routes for each feature of the app
  const childRoutes = app.features.map((feature: IFeature) => {
    let vcMap = null
    if (app.vcMap) {
      vcMap = { title: feature.name, ...app.vcMap }
    }

    const childPath = `/${convertStringToPath(feature.name)}`;
    const childElement = <GenericPage componentsData={feature.components} services={feature.services} vcMap={vcMap} />;

    // Create a React Router Route for the combined path, rendering the child element
    const combinePath = `${mainPath}${childPath}`;
    return <Route key={combinePath} path={combinePath} element={childElement} />;
  });

  // Create a React Router Route for the main path, rendering the main element and its child routes
  const elements = [
    <Fragment key={mainPath}>
      <Route key={mainPath} path={mainPath} element={mainElement} />
      {childRoutes}
    </Fragment>
  ]

  console.log(app.vcMap)

  // Adding route for the Interactive VC Map pages if any
  if (app.vcMap) {
    elements.push(
      <Route path={app.vcMap.urlPath} element={<InteractiveVCMap title={app.vcMap.name} jsonFileName={app.vcMap.jsonFileName} />} />,
    )
  }

  return elements;
}

function RedirectComponent() {
  useEffect(() => {
    window.location.replace('https://docs.regen.pyx.io/docs/getting-started');
  }, []);

  return null;
}

function Router() {
  return (
    // Define the root routing container using React Router's Routes component
    <Routes>
      {/* Default route for the home page, redirecting to <your redirect page> */}
      <Route path='/' element={<RedirectComponent />} />,
      {/* Route for the Reference Implementation page, rendering the Home component */}
      <Route path='/reference-implementation' element={<Home />} />,      <Route path='/scanning' element={<Scanning />} />,{/* Route for the Verify page */}
      <Route path='/verify' element={<Verify />} />,
      {/* Catch-all route for any unknown paths, redirecting to the 404 page */}
      <Route path='*' element={<Navigate to='/404' />} />,
      {/* Iterate through the appConfig to dynamically generate routes */}
      {appConfig.apps.map(renderRoutes)}
      {appConfig.generalFeatures.map(renderRoutes)}
    </Routes>
  );
}

export default Router;