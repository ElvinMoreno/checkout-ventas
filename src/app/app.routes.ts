import { Routes } from '@angular/router';
import { CheckoutFormComponent } from './components/checkout-form/checkout-form.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';

export const routes: Routes = [
  { path: '', component: CheckoutFormComponent },
  { path: 'resumen', component: OrderSummaryComponent },
  { path: ':invoiceCode', component: CheckoutFormComponent },
];
