import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
  providers: [DatePipe]
})
export class OrderSummaryComponent implements OnInit {
  paymentData: any = null;
  invoiceData: any = null;
  currentDate: string = '';

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.paymentData = navigation.extras.state['paymentData'];
      if (this.paymentData?.data) {
        this.invoiceData = this.paymentData.data;
      }
    }
  }

  ngOnInit(): void {
    if (!this.paymentData || !this.invoiceData) {
      console.error('No hay datos de pago disponibles');
      this.router.navigate(['/']);
      return;
    }

    this.currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    console.log('Datos de factura cargados:', this.invoiceData);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  printInvoice(): void {
    window.print();
  }
}
