package com.Prisma.PRISMA.controller;
import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.dto.MensajeDTO;
import com.Prisma.PRISMA.model.Mensaje;
import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.*;
import com.Prisma.PRISMA.model.ReporteCierre;
import com.Prisma.PRISMA.model.ReporteProblema;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {
    private final ReporteCierreRepository reporteRepository;
    private final ReporteProblemaRepository problemaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MensajeRepository mensajeRepository;
    private final SimpMessagingTemplate mensajeria;
    public ReporteController(ReporteCierreRepository reporteRepository, ReporteProblemaRepository problemaRepository, UsuarioRepository usuarioRepository, MensajeRepository mensajeRepository, SimpMessagingTemplate mensajeria) {
        this.reporteRepository = reporteRepository;
        this.problemaRepository = problemaRepository;
        this.usuarioRepository = usuarioRepository;
        this.mensajeRepository = mensajeRepository;
        this.mensajeria = mensajeria;
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

            ReporteCierre guardado = reporteRepository.save(reporte);
            avisoSup(auth.getName(),
                    "Reporte de cierre: " + (comentario == null || comentario.isBlank() ? "sin comentario" : comentario),
                    "reporte");
            return ResponseEntity.ok(guardado);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("No se pudo guardar la foto");


        }



    }
    @PostMapping("/problema")
    public ResponseEntity<?>problema(
            Authentication auth,
            @RequestParam("foto") MultipartFile foto,
            @RequestParam("comentario") String comentario
    ){
        if(foto.isEmpty())return ResponseEntity.badRequest().body("Falta foto");
        if(comentario.isBlank())return ResponseEntity.badRequest().body("Describe el problema");

        String tipo = foto.getContentType();
        String extens;
        if ("image/jpeg".equals(tipo) || "image/jpg".equals(tipo)) extens = "jpg";
        else if ("image/png".equals(tipo)) extens = "png";
        else return ResponseEntity.badRequest().body("La foto debe ser JPG o PNG");
        try {
            Path carpeta = Path.of("uploads", "problema");
            Files.createDirectories(carpeta);
            String nombre = "problema" + System.currentTimeMillis() + "." + extens;

            Files.copy(foto.getInputStream(), carpeta.resolve(nombre));

            ReporteProblema problema = new ReporteProblema();
            problema.setComentario(comentario);
            problema.setCorreoPromotor(auth.getName());
           problema.setFotoURL("/uploads/problema/" + nombre);

            ReporteProblema guardado = problemaRepository.save(problema);
            avisoSup(auth.getName(), "Reporte de problema: " + comentario, "problema");
            return ResponseEntity.ok(guardado);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("No se pudo guardar la foto");

        }
    }

    // Lista de cierres (supervisor). Con ?correo= solo los de ese promotor
    @GetMapping("/cierre")
    public List<ReporteCierre> listarCierres(@RequestParam(value = "correo", required = false) String correo) {
        if (correo != null && !correo.isBlank()) return reporteRepository.findByCorreoPromotorOrderByFechaDesc(correo);
        return reporteRepository.findAllByOrderByFechaDesc();
    }

    // Lista de problemas (supervisor). Con ?correo= solo los de ese promotor
    @GetMapping("/problema")
    public List<ReporteProblema> listarProblemas(@RequestParam(value = "correo", required = false) String correo) {
        if (correo != null && !correo.isBlank()) return problemaRepository.findByCorreoPromotorOrderByFechaDesc(correo);
        return problemaRepository.findAllByOrderByFechaDesc();
    }

    private void avisoSup(String promotor, String texto, String tipo){
        List<Usuario>supervisor = usuarioRepository.findByRol("supervisor");
        for(Usuario sup : supervisor){
            Mensaje m = new Mensaje();
            m.setRemitente(promotor);
            m.setReceptor(sup.getCorreo());
            m.setContenido(texto);
            MensajeDTO dto = MensajeDTO.from(mensajeRepository.save(m));

            mensajeria.convertAndSendToUser(sup.getCorreo(), "/queue/mensajes", dto);
            mensajeria.convertAndSendToUser(promotor, "/queue/mensajes", dto);
            mensajeria.convertAndSendToUser(sup.getCorreo(), "/queue/alertas",
                    new AlertaDTO(null, texto, tipo, null, LocalDateTime.now()));
        }
    }
}
