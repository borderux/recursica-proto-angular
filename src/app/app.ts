import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeProviderComponent } from '@recursica/adapter-angular-material';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeProviderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
