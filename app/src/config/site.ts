export const SITE = {
  name: 'Práctica Vial',
  url: 'https://www.practicavial.com.ar',
  contactEmail: 'm.galmarino@gmail.com',
  adsenseClient: 'ca-pub-6771833588582297',
  ownerName: 'TODO: nombre o razón social del responsable',
  ownerLocation: 'TODO: ciudad, Argentina',
  lastLegalUpdate: '23 de octubre de 2026',
};

/** Si el responsable sigue sin cargar, las páginas legales hablan del equipo. */
export function responsibleName(): string {
  return SITE.ownerName.startsWith('TODO') ? 'el equipo de Práctica Vial' : SITE.ownerName;
}
