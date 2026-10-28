package com.Prisma.PRISMA.dto;

import com.Prisma.PRISMA.model.Mensaje;


public record SendMensajeDTO(
        String receptor,
        String contenido) {
};
