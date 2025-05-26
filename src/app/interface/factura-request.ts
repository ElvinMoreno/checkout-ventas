import { DetalleFactura } from "./detalle-factura";

export interface FacturaRequest {
  id: number;
  numeroFactura: string;
  fechaEmision: string;
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    direccion: string;
  };
  envio: {
    id: number;
    ubicacion: string;
    precio: number;
  };
  detalles: DetalleFactura[];
  subtotal: number;
  totalImpuestos: number;
  total: number;
}
