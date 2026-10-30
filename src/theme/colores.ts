// Colores de los círculos de fondo (los mismos tonos nácar del login)
export const iris = ["#C6ECF8", "#D8D1FF", "#FDE2E2", "#FFF4D6", "#D1FADF", "#E2DDFB", "#D2F4E3"];

export const colorMensajes = {
    tinta: "#1B1733",
    niebla: "#6B6787",
    borde: "#E4E2EE",
    fondo: "#F5F4FB",
    lila: "#E2DDFB",
    prisma: "#5743C2",
    prismaDark: "#4636A8",
    leido: "#7DD3FC",
};

// Estados de stock: fondo pastel (los mismos iris) + un tono fuerte para texto y franja
export const colorStock = {
    optimo: { fondo: iris[4], fuerte: "#1E8A5A", texto: "Stock óptimo" },
    bajo: { fondo: iris[3], fuerte: "#C08A12", texto: "Stock bajo" },
    critico: { fondo: iris[2], fuerte: "#D64545", texto: "Stock crítico" },
};

// Degradado de mis burbujas: de más luminoso (arriba-izq) a más profundo (abajo-der).
// "as const" porque LinearGradient exige al menos 2 colores y así TypeScript lo sabe
export const gradienteMio = ["#6C4CF5", "#5743C2"] as const;
