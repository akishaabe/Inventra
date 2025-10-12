import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DashboardComponent
  ],
  providers: [DecimalPipe]
})
export class DashboardModule {}
