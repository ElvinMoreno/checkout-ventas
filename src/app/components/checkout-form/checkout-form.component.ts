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
  envio: Envio | null;
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
  isProcessingPayment: boolean = false;
  paymentCompleted: boolean = false;

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

  get isFormValid(): boolean {
    if (!this.invoiceData?.cliente) return false;

    const nameParts = this.checkoutData.fullName?.trim().split(/\s+/) || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';
    const identification = this.invoiceData.cliente.cedula?.trim() || '';

    return !!(
      firstName &&
      lastName &&
      identification &&
      this.checkoutData.email?.trim() &&
      this.invoiceData.envio!.ubicacion?.trim() &&
      this.checkoutData.city?.trim() &&
      this.checkoutData.country?.trim() &&
      this.checkoutData.cardNumber?.replace(/\s/g, '').length >= 13 &&
      this.checkoutData.expiryDate?.length === 5 &&
      this.checkoutData.cvv?.length >= 3
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
  }

  isValidExpiryDate(expiryDate: string): boolean {
    if (expiryDate.length !== 5 || !expiryDate.includes('/')) return false;

    const [month, year] = expiryDate.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    return monthNum >= 1 && monthNum <= 12 &&
           (yearNum > currentYear || (yearNum === currentYear && monthNum >= currentMonth));
  }

  ngOnInit(): void {
    // Verificar si estamos en la ruta de resumen
    if (this.router.url === '/resumen') {
      console.log('Estamos en la página de resumen, no cargar datos de factura');
      this.isLoading = false;
      return;
    }

    // Solo cargar datos si no hemos completado el pago y no estamos en resumen
    if (!this.paymentCompleted) {
      this.route.paramMap.subscribe(params => {
        this.invoiceCode = params.get('invoiceCode') || '';

        // Verificación adicional para evitar cargar 'resumen' como código
        if (this.invoiceCode && this.invoiceCode !== 'resumen') {
          this.loadInvoiceData(this.invoiceCode);
        } else if (!this.invoiceCode) {
          // Solo mostrar error si realmente no hay código (ruta raíz)
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = 'No se proporcionó un código de factura en la URL';
        } else {
          // Si el código es 'resumen', simplemente no hacer nada
          this.isLoading = false;
        }
      });
    }
  }

  loadInvoiceData(code: string): void {
    // Verificaciones adicionales de seguridad
    if (this.paymentCompleted || code === 'resumen' || !code.trim()) {
      console.log('Evitando carga de datos:', { paymentCompleted: this.paymentCompleted, code });
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('Cargando datos para código:', code);

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

    this.checkoutData = {
      ...this.checkoutData,
      fullName: `${this.invoiceData.cliente.nombre || ''} ${this.invoiceData.cliente.apellido || ''}`.trim(),
      address: this.invoiceData.cliente.direccion || '',
    };
  }

  updateFirstName(firstName: string): void {
    const lastName = this.checkoutData.fullName?.split(' ')[1] || '';
    this.checkoutData.fullName = `${firstName} ${lastName}`.trim();
  }

  updateLastName(lastName: string): void {
    const firstName = this.checkoutData.fullName?.split(' ')[0] || '';
    this.checkoutData.fullName = `${firstName} ${lastName}`.trim();
  }

  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    let value = target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      target.value = parts.join(' ');
      this.checkoutData.cardNumber = parts.join(' ');
    } else {
      target.value = value;
      this.checkoutData.cardNumber = value;
    }
  }

  formatExpiryDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    let value = target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    target.value = value;
    this.checkoutData.expiryDate = value;
  }

  onSubmit(): void {
    if (!this.invoiceData || !this.isFormValid) {
      this.hasError = true;
      this.errorMessage = !this.invoiceData
        ? 'No hay datos de factura'
        : 'Complete todos los campos';
      return;
    }

    this.isProcessingPayment = true;

    this.facturacionService.completarPago(this.invoiceData.codigoTransaccion).subscribe({
      next: (response) => {
        console.log('Pago exitoso:', response);
        this.paymentCompleted = true;

        // Navegar al resumen con datos
        this.router.navigate(['/resumen'], {
          state: { paymentData: response }
        });
      },
      error: (err) => {
        console.error('Error en pago:', err);
        this.hasError = true;
        this.errorMessage = 'Error al procesar el pago';
        this.isProcessingPayment = false;
      }
    });
  }
}
