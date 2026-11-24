package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.service.EquipoService;


import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Tarea;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import com.Prisma.PRISMA.repository.ReporteProblemaRepository;
import com.Prisma.PRISMA.repository.TareaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import com.Prisma.PRISMA.model.Usuario;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class TareaController {
    private final TareaRepository tareaRepository;
    private final TiendaRepository tiendaRepository;
    private final SimpMessagingTemplate mensajeria;
    private final AsignarTiendaRepository asignarTiendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EquipoService equipoService;

    public TareaController(TareaRepository tareaRepository, TiendaRepository tiendaRepository,
                           SimpMessagingTemplate mensajeria, AsignarTiendaRepository asignarTiendaRepository,
                           UsuarioRepository usuarioRepository, EquipoService equipoService) {
        this.tareaRepository = tareaRepository;
        this.tiendaRepository = tiendaRepository;
        this.mensajeria = mensajeria;
        this.asignarTiendaRepository = asignarTiendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.equipoService = equipoService;
    }

    public record TareaCadena(String nombreTarea, String tipo, String cadena) {}


    public record NuevaTarea(String nombreTarea, String correoPromotor, String tipo, Long idTienda) {
    }


    @PostMapping
    public ResponseEntity<?> crear(@RequestBody NuevaTarea body) {

        Tienda tienda = tiendaRepository.findById(body.idTienda()).orElse(null);
        if (tienda == null) return ResponseEntity.badRequest().body("La tienda no esta registrada");


        Tarea tarea = new Tarea();
        tarea.setTipo(body.tipo());
        tarea.setCorreoPromotor(body.correoPromotor());
        tarea.setTienda(tienda);
        tarea.setNombreTarea(body.nombreTarea());
        Tarea guardada = tareaRepository.save(tarea);
        avisar(guardada);
        return ResponseEntity.ok(guardada);

    }

    @PostMapping("/cadena")
    public ResponseEntity<?> crearPorCadena(@RequestBody TareaCadena body, Authentication auth) {
        if (body.cadena() == null || body.cadena().isBlank()) return ResponseEntity.badRequest().body("Falta la tienda");
        if (body.nombreTarea() == null || body.nombreTarea().isBlank()) return ResponseEntity.badRequest().body("Falta la descripción");

        List<Tienda> sucursales = tiendaRepository.findByNombreIgnoreCase(body.cadena().trim());
        if (sucursales.isEmpty()) return ResponseEntity.badRequest().body("La tienda no esta registrada");

        List<Tarea> creadas = new ArrayList<>();
        Set<String> promotores = new LinkedHashSet<>();
        Set<String> equipo = auth == null ? null : equipoService.correosDelEquipo(auth.getName());
        for (Tienda sucursal : sucursales) {
            for (AsignarTienda asignacion : asignarTiendaRepository.findByTienda_IdTienda(sucursal.getIdTienda())) {
                if (equipo != null && !equipo.contains(asignacion.getCorreoPromotor())) continue;
                Tarea tarea = new Tarea();
                tarea.setTipo(body.tipo());
                tarea.setNombreTarea(body.nombreTarea().trim());
                tarea.setCorreoPromotor(asignacion.getCorreoPromotor());
                tarea.setTienda(sucursal);
                Tarea guardada = tareaRepository.save(tarea);
                avisar(guardada);
                creadas.add(guardada);
                promotores.add(asignacion.getCorreoPromotor());
            }
        }

        if (creadas.isEmpty()) return ResponseEntity.badRequest().body("Ningún promotor de tu equipo tiene asignada esa tienda");
        return ResponseEntity.ok(Map.of("creadas", creadas.size(), "promotores", promotores));
    }

    private void avisar(Tarea tarea) {
        if (tarea.getCorreoPromotor() == null) return;
        mensajeria.convertAndSendToUser(tarea.getCorreoPromotor(), "/queue/alertas", new AlertaDTO(
                tarea.getTienda().getIdTienda(),
                tarea.getNombreTarea() + " · " + tarea.getTienda().getNombre(),
                tarea.getTipo(),
                tarea.getNombreTarea(),
                LocalDateTime.now()
        ));
    }

    @GetMapping
    public List<Tarea> todas(){
        return tareaRepository.findAll();
    }
    @GetMapping("/mio")
    public List<Tarea>mio (Authentication auth){
        return
                tareaRepository.findByCorreoPromotorOrderByFechaDesc(auth.getName());

    }

    @PutMapping("/{id}/check")
    public ResponseEntity<?> check(@PathVariable Long id){
        return tareaRepository.findById(id).map(t-> {
            t.setCheckTarea((!t.isCheckTarea()));
            t.setFechaCheck(t.isCheckTarea() ? LocalDateTime.now() : null);
            if (!t.isCheckTarea()) t.setFotoURL(null);
            return ResponseEntity.ok(tareaRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());

    }

    @PostMapping("/{id}/completar")
    public ResponseEntity<?> completar(@PathVariable Long id, @RequestParam("foto") MultipartFile foto, Authentication auth) {
        if (foto.isEmpty()) return ResponseEntity.badRequest().body("Falta la foto de evidencia");

        String tipo = foto.getContentType();
        String extens;
        if ("image/jpeg".equals(tipo) || "image/jpg".equals(tipo)) extens = "jpg";
        else if ("image/png".equals(tipo)) extens = "png";
        else if ("image/webp".equals(tipo)) extens = "webp";
        else return ResponseEntity.badRequest().body("La foto debe ser JPG o PNG");

        Tarea tarea = tareaRepository.findById(id).orElse(null);
        if (tarea == null) return ResponseEntity.notFound().build();
        if (!tarea.getCorreoPromotor().equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.status(403).body("Esta tarea no es tuya");
        }

        try {
            Path carpeta = Path.of("uploads", "tareas");
            Files.createDirectories(carpeta);
            String nombre = "tarea" + id + "-" + System.currentTimeMillis() + "." + extens;
            Files.copy(foto.getInputStream(), carpeta.resolve(nombre));

            tarea.setFotoURL("/uploads/tareas/" + nombre);
            tarea.setCheckTarea(true);
            tarea.setFechaCheck(LocalDateTime.now());
            Tarea guardada = tareaRepository.save(tarea);
            avisarTareaLista(guardada);
            return ResponseEntity.ok(guardada);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("No se pudo guardar la foto");
        }
    }

    private void avisarTareaLista(Tarea tarea) {
        Usuario promotor = usuarioRepository.findByCorreo(tarea.getCorreoPromotor()).orElse(null);
        String nombre = promotor != null && promotor.getNombre() != null ? promotor.getNombre() : tarea.getCorreoPromotor();
        String texto = nombre + " completó: " + tarea.getNombreTarea() + " · " + tarea.getTienda().getNombre();

        for (Usuario sup : equipoService.supervisoresDe(tarea.getCorreoPromotor())) {
            mensajeria.convertAndSendToUser(sup.getCorreo(), "/queue/alertas", new AlertaDTO(
                    tarea.getTienda().getIdTienda(),
                    texto,
                    "tareaLista",
                    tarea.getNombreTarea(),
                    LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/evidencias")
    public List<Tarea> evidencias() {
        return tareaRepository.findByFotoURLIsNotNullOrderByFechaCheckDesc();
    }


}