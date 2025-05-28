import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import { FaHandsHelping, FaBookOpen, FaServer } from 'react-icons/fa';

const FeatureList = [
  {
    title: 'Misión',
    Icon: FaHandsHelping,
    description: (
      <>
        Escalando Fronteras es una plataforma para la gestión de contenido, eventos y testimonios de la asociación civil, con el objetivo de empoderar a jóvenes a través de la escalada y la educación.
      </>
    ),
  },
  {
    title: 'Documentación Clara',
    Icon: FaBookOpen,
    description: (
      <>
        Aquí encontrarás guías, referencia de la API y buenas prácticas para contribuir y aprovechar al máximo el proyecto.
      </>
    ),
  },
  {
    title: 'Tecnología Robusta',
    Icon: FaServer,
    description: (
      <>
        Backend en Node.js, Express y Prisma, frontend moderno y despliegue en la nube. Seguridad, roles, internacionalización y más.
      </>
    ),
  },
];

function Feature({title, Icon, description}: any) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Icon size={64} color="#2e8555" style={{marginBottom: 16}} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <Heading as="h1">Documentación de Escalando Fronteras</Heading>
          <p className="hero__subtitle">
            Todo lo que necesitas para instalar, usar y contribuir al proyecto de Escalando Fronteras.
          </p>
          <Link
            className="button button--primary button--lg"
            to="/docs/guia-uso">
            Ir a la Guía de Uso
          </Link>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
