export type RegistroDesempeno = {
  periodo: string;
  ventas: number; 
  reposiciones: number;
  tareasAsignadas: number;
  tareasCumplidas: number;
};

export type Promotor = {
  id: string;
  nombre: string;
  zona: "Norte" | "Centro" | "Sur"; 
  historial: RegistroDesempeno[]; 
};

export const promotores: Promotor[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    zona: "Sur", 
    historial: [
      { periodo: "Sep 2026", ventas: 1850000, reposiciones: 42, tareasAsignadas: 30, tareasCumplidas: 27 },
      { periodo: "Ago 2026", ventas: 2120000, reposiciones: 55, tareasAsignadas: 40, tareasCumplidas: 38 },
      { periodo: "Jul 2026", ventas: 1980000, reposiciones: 48, tareasAsignadas: 38, tareasCumplidas: 33 },
      { periodo: "Jun 2026", ventas: 1760000, reposiciones: 40, tareasAsignadas: 36, tareasCumplidas: 28 },
    ],
  },
  {
    id: "2",
    nombre: "Matías Soto",
    zona: "Centro",
    historial: [
      { periodo: "Sep 2026", ventas: 1320000, reposiciones: 31, tareasAsignadas: 28, tareasCumplidas: 17 },
      { periodo: "Ago 2026", ventas: 1540000, reposiciones: 38, tareasAsignadas: 35, tareasCumplidas: 24 },
      { periodo: "Jul 2026", ventas: 1610000, reposiciones: 36, tareasAsignadas: 34, tareasCumplidas: 26 },
      { periodo: "Jun 2026", ventas: 1480000, reposiciones: 33, tareasAsignadas: 32, tareasCumplidas: 25 },
    ],
  },
  {
    id: "3",
    nombre: "Valentina Muñoz",
    zona: "Norte", 
    historial: [
      { periodo: "Sep 2026", ventas: 2410000, reposiciones: 60, tareasAsignadas: 32, tareasCumplidas: 31 },
      { periodo: "Ago 2026", ventas: 2380000, reposiciones: 58, tareasAsignadas: 41, tareasCumplidas: 40 },
      { periodo: "Jul 2026", ventas: 2250000, reposiciones: 52, tareasAsignadas: 39, tareasCumplidas: 37 },
      { periodo: "Jun 2026", ventas: 2100000, reposiciones: 50, tareasAsignadas: 37, tareasCumplidas: 34 },
    ],
  },
];