export interface DetalleFactura {
  id: number;
  productoTalla: {
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
  };
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}
