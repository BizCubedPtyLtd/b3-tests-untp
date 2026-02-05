import * as React from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { convertStringToPath } from '../utils';
import appConfig from '../constants/app-config.json';

const Home = () => {
  const renderApps = () => {
    const apps = appConfig.apps.flatMap((configApp) => {
      if (configApp.enabled && !configApp.enabled) return [];
      
      const path = `/${convertStringToPath(configApp.name)}`;
      const elements = [
        <Button
          sx={{
            color: 'primary.typography',
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
          key={path}
          variant='contained'
          component={Link}
          to={path}
        >
          {configApp.name}
        </Button>
       ];

      if (configApp.vcMap) {
        elements.push(
          <Button
            sx={{
              color: 'primary.typography',
              backgroundColor: 'primary.button',
              boxShadow: 'none',
              borderRadius: 0,
              textTransform: 'none',
              '&:hover': {
                // filter: 'brightness(0.9)',
                backgroundColor: 'primary.main',
                boxShadow: 'none',
              },
            }}
            key={configApp.vcMap.urlPath}
            variant='contained'
            component={Link}
            to={configApp.vcMap.urlPath}
          >
            {configApp.vcMap.name}
          </Button>
        );
      }

      return elements;
    });

    apps.push(
      <Button
        sx={{
          color: 'primary.typography',
          '&:hover': {
            filter: 'brightness(0.9)',
          },
        }}
        key={'/scanning'}
        variant='contained'
        component={Link}
        to={'/scanning'}
      >
        Scanning
      </Button>,
    );

    return apps;
  };

  const renderGenericFeature = () => {
    const generateFeature = appConfig.generalFeatures.map((feature) => {
      const path = `/${convertStringToPath(feature.name)}`;
      return (
        <Button
          sx={{
            color: 'primary.typography',
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
          key={path}
          variant='contained'
          component={Link}
          to={path}
        >
          {feature.name}
        </Button>
      );
    });

    return generateFeature;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',

        height: '100%',
        width: '100%',
        gap: '24px',

        paddingTop: '50px',
        marginTop: '64px',
      }}
    >
      {renderApps()}
      {renderGenericFeature()}
    </Box>
  );
};

export default Home;
