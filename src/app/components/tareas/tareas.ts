import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../../services/tarea';
import { Tarea } from '../../models/tarea';

@Component({
  selector: 'app-tareas',
  imports: [FormsModule],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css'
})
export class Tareas implements OnInit {
  private tareaService = inject(TareaService);

  tareas = signal<Tarea[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // Campos del formulario
  nuevoTitulo = '';
  nuevaDescripcion = '';
  nuevaPrioridad: 'baja' | 'media' | 'alta' = 'media';

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.tareaService.getAll().subscribe({
      next: (data) => {
        this.tareas.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo conectar con Strapi. Verifica que esté corriendo en http://localhost:1337');
        this.cargando.set(false);
      }
    });
  }

  crearTarea(): void {
    if (!this.nuevoTitulo.trim()) return;

    this.tareaService.create({
      titulo: this.nuevoTitulo.trim(),
      descripcion: this.nuevaDescripcion.trim() || undefined,
      prioridad: this.nuevaPrioridad,
      completada: false
    }).subscribe({
      next: () => {
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.nuevaPrioridad = 'media';
        this.cargarTareas();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al crear la tarea.');
      }
    });
  }

  toggleCompletada(tarea: Tarea): void {
    this.tareaService.update(tarea.documentId, { completada: !tarea.completada })
      .subscribe({
        next: () => this.cargarTareas(),
        error: (err) => console.error(err)
      });
  }

  eliminarTarea(documentId: string): void {
    this.tareaService.delete(documentId).subscribe({
      next: () => this.cargarTareas(),
      error: (err) => console.error(err)
    });
  }
}