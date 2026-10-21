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
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic.charAt(0).toUpperCase() + topic.slice(1);
}
