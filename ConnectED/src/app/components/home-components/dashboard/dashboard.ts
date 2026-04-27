import { Component } from '@angular/core';
import { Summary } from '../summary/summary';

@Component({
  selector: 'app-dashboard',
  imports: [Summary],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
