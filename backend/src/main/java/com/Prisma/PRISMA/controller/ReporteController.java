package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.ReporteCierre;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;


@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {
    private final ReporteCierreRepository reporteRepository;
    private ResponseEntity<String> body;

    public ReporteController(ReporteCierreRepository reporteRepository) {
        this.reporteRepository = reporteRepository;

    }

    @PostMapping("/cierre")
    public ResponseEntity<?> cierre(
            Authentication auth,
            @RequestParam("foto") MultipartFile foto,
            @RequestParam("latitud") double latitud,
            @RequestParam("longitud") double longitud,
            @RequestParam(value = "comentario", required = false) String comentario,
            @RequestParam(value = "precision", required = false) Integer precision

    ) {
        if (foto.isEmpty()) {
            return ResponseEntity.badRequest().body("Falta foto");

        }

        String tipo = foto.getContentType();
        String extens;
        if ("image/jpeg".equals(tipo) || "image/jpg".equals(tipo)) extens = "jpg";
        else if ("image/png".equals(tipo)) extens = "png";
        else return ResponseEntity.badRequest().body("La foto debe ser JPG o PNG");
        try {
            Path carpeta = Path.of("uploads", "reportes");
            Files.createDirectories(carpeta);
            String nombre = "cierre" + System.currentTimeMillis() + "." + extens;

            Files.copy(foto.getInputStream(), carpeta.resolve(nombre));

            ReporteCierre reporte = new ReporteCierre();
            reporte.setComentario(comentario);
            reporte.setCorreoPromotor(auth.getName());
            reporte.setLatitud(latitud);
            reporte.setLongitud(longitud);
            reporte.setPrecisionMT(precision);
            reporte.setFotoURL("/uploads/reportes/" + nombre);

            return ResponseEntity.ok(reporteRepository.save(reporte));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("No se pudo guardar la foto");

        }
    }


}
