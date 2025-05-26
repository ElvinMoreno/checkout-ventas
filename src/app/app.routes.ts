import { Routes } from '@angular/router';
import { CheckoutFormComponent } from './components/checkout-form/checkout-form.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';

export const routes: Routes = [
  { path: '', component: CheckoutFormComponent },
  { path: ':invoiceCode', component: CheckoutFormComponent }, // Nueva ruta con parámetro
  { path: 'resumen', component: OrderSummaryComponent },
];
