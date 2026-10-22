export interface FaqItem {
  question: string;
  answer: string;
}

export interface StudyGraphInput {
  pathname: string;
  title: string;
  description: string;
  dateModified: string;
  quizName: string;
  legislationName: string;
  coverageType: 'Country' | 'AdministrativeArea' | 'City';
  coverageName: string;
  quizAbout: string;
  citations: string[];
  breadcrumbName: string;
  faq: FaqItem[];
}

const ORIGIN = 'https://www.practicavial.com.ar';

export function studyGraph(input: StudyGraphInput): Record<string, unknown> {
  const url = `${ORIGIN}${input.pathname}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: input.title,
        description: input.description,
        inLanguage: 'es-AR',
        dateModified: input.dateModified,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${ORIGIN}/#website`,
          name: 'Práctica Vial',
          url: `${ORIGIN}/`,
        },
        about: [
          { '@type': 'Thing', name: 'Examen teórico de licencia de conducir' },
          { '@type': 'Legislation', name: input.legislationName },
        ],
        spatialCoverage: { '@type': input.coverageType, name: input.coverageName },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        mainEntity: { '@id': `${url}#quiz` },
        citation: input.citations,
      },
      {
        '@type': 'Quiz',
        '@id': `${url}#quiz`,
        name: input.quizName,
        educationalLevel: 'Licencia de conducir clase B1',
        inLanguage: 'es-AR',
        isAccessibleForFree: true,
        about: { '@type': 'Thing', name: input.quizAbout },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: input.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${ORIGIN}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tests',
            item: `${ORIGIN}/test-de-conducir/`,
          },
          { '@type': 'ListItem', position: 3, name: input.breadcrumbName, item: url },
        ],
      },
    ],
  };
}

export function formatSourceDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
