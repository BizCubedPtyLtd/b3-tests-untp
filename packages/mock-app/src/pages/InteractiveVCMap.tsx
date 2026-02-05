import { Box, Button } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import appConfig from '../constants/app-config.json';
import { convertStringToPath } from '../utils';
import { ComponentType, IDynamicComponentRendererProps } from '@mock-app/components';
import { QRCodeCanvas } from 'qrcode.react';
import { LinkType } from '@mock-app/services';

type Props = {
  ID?: {
    pathname: string,
    IDRLink: string,
  };
  title?: string;
  jsonFileName: string; // Parameter for JSON file name
};

type VcMapJson = {
  img: string;
  title: string;
  appConfigName: string;
  areas: Array<{
    alt: string;
    title: string;
    disabled: boolean;
    links: Array<{
      type: string;
      disabled: boolean;
      title: string;
      href: string;
      sample_credential?: string;
    }>;
    coords: string;
    shape: string;
    documentation: {
      title: string;
      link: string;
    };
  }>;
};

const getLinkType = (schemaURL: string) => {
  if (schemaURL) {
    const formattedSchemaURL = schemaURL.toLowerCase();
    if (formattedSchemaURL.includes('product')) return LinkType.sustainabilityInfo;
    if (formattedSchemaURL.includes('facility')) return LinkType.locationInfo;
    if (formattedSchemaURL.includes('conformity')) return LinkType.certificationLinkType;
    if (formattedSchemaURL.includes('traceability')) return LinkType.traceability;
    if (formattedSchemaURL.includes('identity')) return LinkType.registryEntry;
  } else {
    return '';
  }
}

const InteractiveVCMap = ({ ID, title = 'Interactive VC Map', jsonFileName }: Props) => {
  const location = useLocation();
  const pathname = location.pathname;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const previousHighlightRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const [vcMapJson, setVcMapJson] = useState<VcMapJson | null>(null); // Typed state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vcMapConfig, setVcMapConfig] = useState<any>();

  const [popover, setPopover] = useState<{
    x: number;
    y: number;
    data: { title: string; issuingHref: string; credentialURL: string }[] | null;
    documentation: { title: string; link: string } | null;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Fetch JSON data from public directory
  useEffect(() => {
    const fetchVcMapData = async () => {
      try {
        const response = await fetch(`/${jsonFileName}`); // Use jsonFileName prop
        if (!response.ok) {
          throw new Error(`Failed to fetch ${jsonFileName}`);
        }
        const data: VcMapJson = await response.json();
        setVcMapJson(data);
        setLoading(false);
      } catch (err) {
        setError(`Error loading ${jsonFileName}`);
        setLoading(false);
      }
    };
    fetchVcMapData();
  }, [jsonFileName]); // Re-fetch if jsonFileName changes

  useEffect(() => {
    if (vcMapJson && vcMapJson.appConfigName) {
      if (appConfig && 'apps' in appConfig) {
        const apps: any = appConfig.apps
        setVcMapConfig(apps.find((app: any) => app.name === vcMapJson.appConfigName))
      }
    }
  }, [vcMapJson])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgDimensions.width === 0 || imgDimensions.height === 0) return;

    canvas.width = imgDimensions.width;
    canvas.height = imgDimensions.height;

    const context = canvas.getContext('2d');
    if (!context) return;
  }, [imgDimensions]);

  useEffect(() => {
    if (!vcMapJson) return;
    const canvas = canvasRef.current;
    if (!canvas || imgDimensions.width === 0 || imgDimensions.height === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const activeArea = vcMapJson.areas.find((area) =>
      area.links.some((link) => link.type === 'internal' && link.href === pathname)
    );

    if (activeArea) {
      drawRect(context, activeArea.coords, 'red', true);
    }

    previousHighlightRef.current = null;
  }, [pathname, imgDimensions, vcMapJson]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };

    if (popover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popover]);

  const onImgLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });

    if (canvasRef.current) {
      canvasRef.current.width = img.naturalWidth;
      canvasRef.current.height = img.naturalHeight;
    }
  };

  const drawRect = (
    context: CanvasRenderingContext2D,
    coords: string,
    color: string = 'red',
    isActive: boolean = false,
    overlayOpacity: number = 0.3
  ) => {
    const [x1, y1, x2, y2] = coords.split(',').map(Number);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    if (isActive) {
      context.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
      context.fillRect(x, y, width, height);
    }

    context.strokeStyle = color;
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
  };

  const handleAreaMouseEnter = (coords: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (previousHighlightRef.current) {
      const { x, y, width, height } = previousHighlightRef.current;
      context.clearRect(x - 1, y - 1, width + 2, height + 2);
    }

    const [x1, y1, x2, y2] = coords.split(',').map(Number);
    const rect = {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };

    previousHighlightRef.current = rect;

    drawRect(context, coords, 'red');
  };

  const handleAreaMouseLeave = (coords: string) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !previousHighlightRef.current) return;

    const activeArea = vcMapJson?.areas.find((area) =>
      area.links.some((link) => link.type === 'internal' && link.href === pathname)
    );
    const isActiveArea = activeArea?.coords === coords;

    if (isActiveArea) {
      previousHighlightRef.current = null;
      return;
    }

    const { x, y, width, height } = previousHighlightRef.current;
    context.clearRect(x - 1, y - 1, width + 2, height + 2);

    previousHighlightRef.current = null;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!vcMapJson) return <div>No map data available</div>;

  return (
    <div style={{ padding: '30px 0', placeSelf: 'center' }}>
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <div
        style={{
          overflow: 'auto',
          position: 'relative',
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        <img
          src={vcMapJson.img}
          alt={vcMapJson.title}
          useMap="#interactive_vc_map"
          onLoad={onImgLoad}
          style={{ display: 'block' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <map name="interactive_vc_map">
          {vcMapJson.areas.map((area, index) => {
            if (area.disabled) return;
            const active = area.links.some((link) => link.type === 'internal' && link.href === pathname);

            let documentation: { title: string; link: string } | null = null;
            if (area.documentation.title && area.documentation.link) {
              documentation = area.documentation;
            }

            const internalURLs: { title: string; issuingHref: string; credentialURL: string }[] = [];
            const externalURLs: { title: string; issuingHref: string; credentialURL: string }[] = [];

            area.links.forEach((link) => {
              let features: any[] = [];
              let components: IDynamicComponentRendererProps[] = [];

              if (vcMapConfig && 'features' in vcMapConfig) {
                features = vcMapConfig.features;
              }

              const lastPathSegment = link.href.split('/').pop();

              const feature = features.find((_feature: any) =>
                convertStringToPath(_feature.name) === lastPathSegment
              );

              if (feature && 'components' in feature) {
                components = feature.components;
              }

              const componentEntryData = components.find(
                (_component: IDynamicComponentRendererProps) => _component.type === ComponentType.EntryData
              );

              const linkType = getLinkType(componentEntryData?.props?.schema?.url ?? componentEntryData?.props.nestedComponents[0]?.props?.schema?.url)
              let id = componentEntryData?.props.data?.id ?? componentEntryData?.props.nestedComponents[0]?.props?.data?.id;
              if (linkType) id = id + `?linkType=gs1:${linkType}`

              if (link.disabled) return;
              if (link.type === 'internal') {
                internalURLs.push({
                  title: link.title,
                  issuingHref: link.href ? `${window.location.protocol}//${window.location.host}${link.href}` : '',
                  credentialURL: active ?
                    ID && ID.pathname === pathname && ID.IDRLink ?
                      ID.IDRLink
                      : ''
                    : id ?? ''
                });
              } else if (link.type === 'external') {
                externalURLs.push({
                  title: link.title,
                  issuingHref: link.href ?? '',
                  credentialURL: link.sample_credential ?? '',
                });
              }
            });

            const data = [...internalURLs, ...externalURLs];

            return (
              <area
                key={area.title}
                target="_blank"
                alt={area.alt}
                title={area.title}
                href="#"
                coords={area.coords}
                shape={area.shape}
                onClick={(e) => {
                  e.preventDefault();
                  setPopover({
                    x: e.pageX,
                    y: e.pageY,
                    data: data,
                    documentation: documentation,
                  });
                }}
                onMouseEnter={() => handleAreaMouseEnter(area.coords)}
                onMouseLeave={() => handleAreaMouseLeave(area.coords)}
                data-active={active}
              />
            );
          })}
        </map>
      </div>
      {popover && (
        <Box
          ref={popoverRef}
          sx={{
            position: 'absolute',
            top: popover.y,
            left: popover.x,
            backgroundColor: '#fff',
            border: '1px solid black',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 10,
            fontFamily: 'system-ui, sans-serif',
            color: '#111827',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
          className={popover ? 'visible' : ''}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              variant="contained"
              color="info"
              href={popover.documentation ? popover.documentation.link : ''}
              target="_blank"
              sx={{
                width: 'fit-content',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'none',
                padding: '5px 10px',
              }}
            >
              {popover.documentation?.title}
            </Button>
            {popover.data && popover.data.length ? (
              popover.data.map((item) => (
                <div key={item.title}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontFamily: 'system-ui, sans-serif',
                      marginBottom: '3px',
                      fontWeight: '600',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      href={item.issuingHref}
                      target="_blank"
                      sx={{
                        width: 'fit-content',
                        height: 'fit-content',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'none',
                        padding: '5px 10px',
                      }}
                    >
                      Go to Issuing Page
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      href={item.credentialURL}
                      target="_blank"
                      sx={{
                        width: 'fit-content',
                        height: 'fit-content',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'none',
                        padding: '5px 10px',
                      }}
                    >
                      Open Issued Credential (sample)
                    </Button>
                  </div>
                  {item.credentialURL ?
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px', gap: '2px' }}>
                      <QRCodeCanvas
                        value={item.credentialURL}
                        title={item.credentialURL}
                        size={100}
                      />
                      <div style={{ fontSize: '12px' }}>
                        {item.credentialURL}
                      </div>
                    </div>
                    :
                    <></>
                  }
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </Box>
      )}
    </div>
  );
};

export default InteractiveVCMap;