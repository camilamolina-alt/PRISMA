// Los 3 niveles posibles. TypeScript no deja usar otro texto distinto.
export type NivelAlerta = "critico" | "retraso" | "pendiente";

export type Alerta = {
  id: string;
  nivel: NivelAlerta;
  titulo: string;
  detalle: string;
  hace: string;
  nueva: boolean;
};

// Datos de mentira (los 3 primeros salen del mockup)
export const alertasMock: Alerta[] = [
  {
    id: "1",
    nivel: "critico",
    titulo: "Quiebre de stock en Paris Concepcion",
    detalle: "Sucursal #P-402",
    hace: "Hace 15 min",
    nueva: true,
  },
  {
    id: "2",
    nivel: "retraso",
    titulo: "Retraso de carga - Camión 04",
    detalle: "Ruta Portal Temuco",
    hace: "Hace 42 min",
    nueva: true,
  },
  {
    id: "3",
    nivel: "pendiente",
    titulo: "Falta de Tarea: Janio Perez",
    detalle: "Zona Sur",
    hace: "Hace 1 hora",
    nueva: true,
  },
  {
    id: "4",
    nivel: "critico",
    titulo: "Quiebre de stock en Falabella Mall Plaza Trebol",
    detalle: "Sucursal #F-118",
    hace: "Hace 3 horas",
    nueva: false,
  },
  {
    id: "5",
    nivel: "pendiente",
    titulo: "Falta de Tarea: Camila Rojas",
    detalle: "Zona Centro",
    hace: "Hace 5 horas",
    nueva: false,
  },
  {
    id: "6",
    nivel: "retraso",
    titulo: "Retraso de carga - Camión 02",
    detalle: "Ruta Concepción - Talcahuano",
    hace: "Ayer",
    nueva: false,
  },
];
