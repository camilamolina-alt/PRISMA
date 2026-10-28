package com.Prisma.PRISMA.dto;


import com.Prisma.PRISMA.model.Mensaje;

import java.time.LocalDateTime;

public record MensajeDTO(
    Long idMensaje,
    String receptor,
    String remitente,
    String contenido,
    LocalDateTime fecha,
    Boolean leido) {


    //Es para que sea dinamco el mensaje

    public static MensajeDTO from(Mensaje m) {
        return new MensajeDTO(
                m.getIdMensaje(),
                m.getReceptor(),
                m.getRemitente(),
                m.getContenido(),
                m.getFecha(),
                m.getLeido()

        );
    }
}