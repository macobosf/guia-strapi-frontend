import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tareas } from './components/tareas/tareas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tareas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
}