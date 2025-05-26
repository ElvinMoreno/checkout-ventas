import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurl } from '../enviroment/apiurl';
import { Observable, throwError } from 'rxjs';
import { FacturaRequest } from '../interface/factura-request';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private apiUrl = `${apiurl.apiUrl}/api/facturas`;

  constructor(private http: HttpClient) {}

  completarPago(codigoTransaccion: string): Observable<any> {
    const url = `${this.apiUrl}/completar-pago/${codigoTransaccion}`;
    return this.http.post(url, {});
  }

  obtenerDatosFactura(codigoTransaccion: string): Observable<any> {
    // Validación adicional para evitar llamadas con códigos inválidos
    if (!codigoTransaccion || codigoTransaccion.trim() === '' || codigoTransaccion === 'resumen') {
      return throwError(() => new Error('Código de transacción inválido'));
    }

    const url = `${this.apiUrl}/pago-pendiente/${codigoTransaccion}`;

    console.log('Llamando a URL:', url);

    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Error fetching invoice:', error);

        // Información más detallada del error
        if (error.status === 500) {
          console.error('Error 500: Problema en el servidor backend');
        } else if (error.status === 404) {
          console.error('Error 404: Factura no encontrada');
        }

        return throwError(() => new Error('Failed to load invoice data'));
      })
    );
  }
}
