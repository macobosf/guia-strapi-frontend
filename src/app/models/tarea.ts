export interface Tarea {
  id: number;
  documentId: string;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  prioridad: 'baja' | 'media' | 'alta';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}