import React from 'react';
import { GenericFeature } from '../components/GenericFeature';
import { IServiceDefinition, IVCMapDefinition } from '../components/GenericFeature/GenericFeature';
import { ToastMessage, IDynamicComponentRendererProps } from '@mock-app/components';

export interface IGenericFeatureProps {
  componentsData: IDynamicComponentRendererProps[];
  services: IServiceDefinition[];
  vcMap: IVCMapDefinition;
}

const GenericPage = ({ componentsData, services, vcMap, ...props }: IGenericFeatureProps) => {
  return (
    <main {...props}>
      <ToastMessage />
      <GenericFeature components={componentsData} services={services} vcMap={vcMap}/>
    </main>
  );
};

export default GenericPage;
