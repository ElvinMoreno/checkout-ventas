import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // For template-driven forms
import { CommonModule } from '@angular/common'; // For common directives like ngIf, ngFor
import { ActivatedRoute, Router } from '@angular/router';
import { FacturaRequest } from '../../interface/factura-request';
import { FacturacionService } from '../../service/facturacion.service';
import { HttpClientModule } from '@angular/common/http';
import { catchError, finalize, of, throwError } from 'rxjs';

interface ProductoTalla {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
  };
  color: {
    id: number;
    nombre: string;
  };
  talla: {
    id: number;
    nombre: string;
  };
  stock: number;
}

interface DetalleFactura {
  producto: ProductoTalla;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

interface Cliente {
  id: number | null;
  nombre: string;
  apellido: string;
  cedula: string;
  direccion: string;
}

interface Envio {
  id: number | null;
  ubicacion: string;
  precio: number;
}

interface FacturaResponse {
  codigoTransaccion: string;
  fechaCreacion: string;
  estado: string;
  cliente: Cliente;
  envio: Envio;
  detalles: DetalleFactura[];
  subtotal: number;
  total: number;
}

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  templateUrl: './checkout-form.component.html',
   imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [FacturacionService],
})
export class CheckoutFormComponent implements OnInit {
  invoiceCode: string = '';
  invoiceData: FacturaResponse | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  hasError: boolean = false;

  checkoutData = {
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facturacionService: FacturacionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.invoiceCode = params.get('invoiceCode') || '';

      if (this.invoiceCode) {
        this.loadInvoiceData(this.invoiceCode);
      } else {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'No se proporcionó un código de factura en la URL';
      }
    });
  }

  loadInvoiceData(code: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.facturacionService.obtenerDatosFactura(code).pipe(
      catchError((err) => {
        this.hasError = true;
        this.errorMessage = 'Error al cargar los datos de la factura. Por favor, inténtelo de nuevo.';
        console.error('Error al cargar la factura:', err);
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.invoiceData = response.data;
          this.populateFormWithInvoiceData();
        } else {
          this.hasError = true;
          this.errorMessage = response?.message || 'Datos de factura no válidos recibidos';
        }
      }
    });
  }

  populateFormWithInvoiceData(): void {
    if (!this.invoiceData?.cliente) {
      console.warn('No hay datos de cliente disponibles en la factura');
      return;
    }

    // Rellenar los datos del formulario con la información de la factura
    this.checkoutData = {
      ...this.checkoutData,
      fullName: `${this.invoiceData.cliente.nombre || ''} ${this.invoiceData.cliente.apellido || ''}`.trim(),
      address: this.invoiceData.cliente.direccion || '',
      // Otros campos pueden dejarse con valores por defecto o vacíos
    };
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      event.target.value = parts.join(' ');
    } else {
      event.target.value = value;
    }
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value;
    if (value.length === 2 && !value.includes('/')) {
      event.target.value = value + '/';
    }
  }

  onSubmit(): void {
    if (!this.invoiceData) {
      this.hasError = true;
      this.errorMessage = 'No hay datos de factura disponibles para procesar';
      return;
    }

    console.log('Formulario enviado!', this.checkoutData);

    // Primero completar el pago
    this.facturacionService.completarPago(this.invoiceData.codigoTransaccion).pipe(
      catchError((err) => {
        this.hasError = true;
        this.errorMessage = 'Error al procesar el pago. Por favor, inténtelo de nuevo.';
        console.error('Error al completar el pago:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        // Navegar a la página de resumen con los datos
        this.router.navigate(['/resumen'], {
          state: {
            checkoutData: this.checkoutData,
            invoiceData: this.invoiceData
          }
        });
      }
    });
  }
}
