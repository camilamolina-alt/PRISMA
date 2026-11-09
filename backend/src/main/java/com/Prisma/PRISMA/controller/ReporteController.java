package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.ReporteCierreDTO;
import com.Prisma.PRISMA.model.ReporteCierre;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteCierreRepository reporteRepository;
    private static final String UPLOAD_DIR = "uploads/fotos-cierre/";

    public ReporteController(ReporteCierreRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }
    @PostMapping(value = "/cierre", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearReporteCierre(
            @RequestPart("foto") MultipartFile foto,
            @RequestParam("latitud") String latitudStr,
            @RequestParam("longitud") String longitudStr,
            @RequestParam(value = "precision", required = false) String precisionStr,
            @RequestParam(value = "comentario", required = false) String comentario,
            @RequestParam("confirmado") String confirmadoStr) {
        try {
            if (foto == null || foto.isEmpty()) {
                return ResponseEntity.badRequest().body("La foto es obligatoria");
            }

            if (latitudStr == null || latitudStr.trim().isEmpty() ||
                    longitudStr == null || longitudStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Las coordenadas son obligatorias");
            }


            Double latitud = Double.parseDouble(latitudStr);
            Double longitud = Double.parseDouble(longitudStr);

            Integer precision = null;
            if (precisionStr != null && !precisionStr.trim().isEmpty()) {
                precision = Integer.parseInt(precisionStr);
            }

            Boolean confirmado = Boolean.parseBoolean(confirmadoStr);


            Path directorioPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            if (!Files.exists(directorioPath)) {
                Files.createDirectories(directorioPath);
            }


            String extension = getExtension(foto.getOriginalFilename());
            String nombreArchivo = UUID.randomUUID() + extension;
            Path rutaGuardada = directorioPath.resolve(nombreArchivo);


            Files.write(rutaGuardada, foto.getBytes());


            String urlFoto = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/reportes/fotos/")
                    .path(nombreArchivo)
                    .toUriString();


            ReporteCierre reporteEntity = new ReporteCierre();
            reporteEntity.setLatitud(latitud);
            reporteEntity.setLongitud(longitud);
            reporteEntity.setPrecision(precision);
            reporteEntity.setComentario(comentario);
            reporteEntity.setConfirmado(confirmado);
            reporteEntity.setFechaEnvio(LocalDateTime.now());
            reporteEntity.setRutaFoto(urlFoto);

            ReporteCierre reporteGuardado = reporteRepository.save(reporteEntity);
            return ResponseEntity.ok(reporteGuardado);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Error de formato numérico en coordenadas o precisión: " + e.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al guardar la imagen: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al procesar el reporte: " + e.getMessage());
        }
    }
    @GetMapping("/fotos/{filename:.+}")
    public ResponseEntity<Resource> obtenerFoto(@PathVariable String filename) {
        try {
            Path directorioPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Path archivoPath = directorioPath.resolve(filename).normalize();
            Resource resource = new UrlResource(archivoPath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(archivoPath);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getExtension(String nombreOriginal) {
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            return nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        return ".jpg";
    }
}
