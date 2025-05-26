import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  checkoutData: any;
  invoiceData: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.checkoutData = navigation.extras.state['checkoutData'];
      this.invoiceData = navigation.extras.state['invoiceData'];
    }
  }
}
