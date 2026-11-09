package com.Prisma.PRISMA.dto;
import java.time.LocalDateTime;

public record ReporteCierreDTO(
        Double latitud,
        Double longitud,
        Integer precision,
        String comentario,
        Boolean confirmado,
        LocalDateTime fechaEnvio
) {
}
