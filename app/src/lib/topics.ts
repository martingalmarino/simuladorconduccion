const TOPIC_LABELS: Record<string, string> = {
  semaforos: 'Semáforos',
  senalizacion: 'Señalización',
  adelantamiento: 'Adelantamiento',
  seguridad: 'Seguridad',
  circulacion: 'Circulación',
  autopistas: 'Autopistas',
  distancia: 'Distancia',
  prioridades: 'Prioridades',
  velocidad: 'Velocidad',
  peatones: 'Peatones',
  documentacion: 'Documentación',
  luces: 'Luces',
  giros: 'Giros',
  alcohol: 'Alcohol',
  fatiga: 'Fatiga',
  distracciones: 'Distracciones',
  estacionamiento: 'Estacionamiento',
  scoring: 'Scoring',
  incidentes: 'Incidentes',
  'seguridad-vehicular': 'Seguridad del vehículo',
  bicicletas: 'Bicicletas',
  adversas: 'Condiciones adversas',
  preventiva: 'Conducción preventiva',
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic.charAt(0).toUpperCase() + topic.slice(1);
}
