import clsx from 'clsx';

const FeatureList = [
  {
    title: 'Scheme A',
    Svg: require('@site/static/img/mock-app-icon.svg').default,
    description: (
      <>
Schema A
</>
    ),
  },
  {
    title: 'Schema B',
    Svg: require('@site/static/img/technical-interoperability-icon.svg').default,
    description: (
      <>
      Scheme B
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--6 home-feature')}>
      <div className="home-feature__content">
        <div className="home-feature__head">
          <div className="home-feature__image">
            <Svg className="home-feature__icon" role="img" />
          </div>
          <h3 className="home-feature__title">{title}</h3>
        </div>
        <p className="home-feature__description">{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className="home-features">
      <div className="home-features__container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}