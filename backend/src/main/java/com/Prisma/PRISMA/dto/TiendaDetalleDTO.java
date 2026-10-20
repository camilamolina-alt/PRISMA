package com.Prisma.PRISMA.dto;

public record TiendaDetalleDTO(
        Long idTienda,
        String nombre,
        String adminis,
        String fono,
        String direccion,
        String departamento,
        String ubicacion,
        long alertasCriticas
) {
}