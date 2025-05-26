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
    const url = `${this.apiUrl}/pago-pendiente/${codigoTransaccion}`;
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Error fetching invoice:', error);
        return throwError(() => new Error('Failed to load invoice data'));
      })
    );
  }

}
