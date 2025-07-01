/**
* @example 
* import { ComponentType, IDynamicComponentRendererProps } from './components/GenericFeature/DynamicComponentRenderer';
* 
* interface IService {
*  (arg1: any, ...args: any[]): any;
* }
* export const logService: IService = (arg1: any, ...args: any[]): any => {
*  console.log(arg1);
*  console.log(args);
*  return arg1;
* };
*
* export const logServiceTwo: IService = (arg1: any, ...args: any[]): any  => {
*  console.log(arg1);
*  return args;
* };

* function Example() {
*   const [jsonFormData, setJsonFormData] = React.useState();
*   const componentsData: IDynamicComponentRendererProps[] = [
*     {
*       name: 'JsonForm', // import from @mock-app/components
*       type: 'EntryData' as ComponentType,
*       props: {
*         schema: {
*           type: 'object',
*           properties: {
*             name: {
*               type: 'string',
*             },
*             vegetarian: {
*               type: 'boolean',
*             },
*           },
*         },
*         onChange: (value: any) => {
*           setJsonFormData(value.data);
*         },
*         uiSchema: {
*           type: 'VerticalLayout',
*           elements: [
*             {
*               type: 'Control',
*               scope: '#/properties/name',
*            },
*             {
*               type: 'Control',
*               scope: '#/properties/vegetarian',
*             },
*          ],
*         },
*         data: {},
*         className: '',
*       },
*     },
*     {
*       name: 'Button',
*       type: 'Submit' as ComponentType,
*       props: {},
*     },
*  ];
*
*    const services = [
*    {
*      name: 'logService',
*      parameters: [jsonFormData],
*    },
*    {
*      name: 'logServiceTwo',
*      parameters: [],
*    },
*  ];
* return (
*    <div className='example'>
*      <GenericFeature components={componentsData} services={services} />
*    </div>
*    );
*  }
*/

import React, { useEffect } from 'react';
import * as services from '@mock-app/services';
// import * as events from '@mock-app/events';
import {
  toastMessage,
  Status,
  ComponentType,
  DynamicComponentRenderer,
  IDynamicComponentRendererProps,
} from '@mock-app/components';
import { QRCodeCanvas } from 'qrcode.react';
import { InteractiveVCMap } from '../../pages';
import { useLocation } from 'react-router-dom';

export interface IServiceDefinition {
  name: string;
  parameters: any[];
}

export interface IGenericFeatureProps {
  components: IDynamicComponentRendererProps[];
  services: IServiceDefinition[];
    vcMap: IVCMapDefinition;
}

export interface IVCMapDefinition {
  name: string;
  title: string;
  img: string;
  jsonFileName: string;
  enable: boolean;
  showQRCode: boolean;
}
  

const getService = (name: string) => {
  const serviceName = name as keyof typeof services;
  if (typeof services[serviceName] !== 'undefined') {
    return services[serviceName];
  }
  // const eventName = name as keyof typeof events;
  // if (typeof events[eventName] !== 'undefined') {
  //   return events[eventName];
  // }
  throw new Error(`Service or event ${name} not found`);
};

const getLinkType = (schemaURL: string) => {
  if (schemaURL) {
    const formattedSchemaURL = schemaURL.toLowerCase();
    if (formattedSchemaURL.includes('product')) return services.LinkType.sustainabilityInfo;
    if (formattedSchemaURL.includes('facility')) return services.LinkType.locationInfo;
    if (formattedSchemaURL.includes('conformity')) return services.LinkType.certificationLinkType;
    if (formattedSchemaURL.includes('traceability')) return services.LinkType.traceability;
    if (formattedSchemaURL.includes('identity')) return services.LinkType.registryEntry;
  } else {
    return '';
  }
}

/**
 *
 * @param param0
 * @returns
 */
export const GenericFeature: React.FC<IGenericFeatureProps> = ({ components, services, vcMap }: IGenericFeatureProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const [state, setState] = React.useState<any[]>([]);
  const [result, setResult] = React.useState<any>();
  const props: Record<string, any> = {};

  const [id, setId] = React.useState<string>('');
  const [IDRLink, setIDRLink] = React.useState<string>('');

  const executeServices = async (services: IServiceDefinition[], parameters: any[]) => {
    const [result] = await services.reduce(async (previousResult: any[] | Promise<any[]>, currentService) => {
      const prevResult = await previousResult;
      const service: any = getService(currentService.name);
      const params = [...prevResult, ...currentService.parameters];
      const result: any = await service(...params);
      return [result];
    }, parameters);
    return result;
  };

  useEffect(() => {
    const entryData = components.find((c) => c.type === ComponentType.EntryData)
    const linkType = getLinkType(entryData?.props?.schema?.url ?? entryData?.props?.nestedComponents[0]?.props?.schema?.url)
    if (id && linkType) {
      setIDRLink(`${id}?linkType=gs1:${linkType}`)
    }
  }, [id, components])

  return (
    <div>
          {vcMap && vcMap.enable ?
        <InteractiveVCMap ID={{IDRLink: IDRLink, pathname:pathname}} title={vcMap.title} jsonFileName={vcMap.jsonFileName} />
        :
        <></>
      }
      {IDRLink && vcMap?.showQRCode && (
        <div style={{marginTop: '10px', justifyItems: 'center'}}>
          <QRCodeCanvas
            value={IDRLink}
            title={IDRLink}
          />
          <div>IDR Link: <a href={IDRLink} target='_blank'>{IDRLink}</a></div>
        </div>
      )}

      {components.map((component, index) => {
        const type = component.type;
        switch (type) {
          case ComponentType.EntryData:
            // unknown is used to flexibilize the type of the value, since it can be any type
            props.onChange = (value: unknown) => {
              // Check for value.data.id and setId if valid
              const maybeId = (value as any)?.data?.id;
              if (typeof maybeId === 'string' && maybeId.trim() !== '') {
                setId(maybeId);
              }
              
              setState((s) => {
                s[index] = value;
                return s;
              });
            };
            break;
          case ComponentType.Submit:
            props.onClick = async (handler: (args: any) => void) => {
              try {
                const result = await executeServices(services, state);

                handler(result);
                setResult(result);
                console.log("result:", state[0]["data"]["id"])
                toastMessage({ status: Status.success, message: 'Action Successful.', linkURL: state[0]["data"]["id"] });
              } catch (error: any) {
                console.log(error.message);
                toastMessage({ status: Status.error, message: 'Something went wrong', linkURL: '' });
              }
            };
            break;
          case ComponentType.Result:
            if (result) {
              props.data = result;
            }
            break;
          default:
            break;
        }

        if (type === ComponentType.Result && !result) {
          return null;
        }
        return (
          <DynamicComponentRenderer
            key={index}
            name={component.name}
            type={component.type}
            props={{ ...props, ...component.props }}
          />
        );
      })}
    </div>
  );
};
