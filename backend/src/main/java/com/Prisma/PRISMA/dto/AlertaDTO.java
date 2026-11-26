package com.Prisma.PRISMA.dto;
import java.time.LocalDateTime;

public record AlertaDTO(
    Long idTienda,
    String mensaje,
    String nivel,
    String producto,
    LocalDateTime fecha){

}

