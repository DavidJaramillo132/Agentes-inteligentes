import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@modules/site/components/navbar/navbar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  template: `
  <app-navbar></app-navbar>
  <router-outlet></router-outlet>
  `
})
export class App {
}
