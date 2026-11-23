package com.Prisma.PRISMA.controller;


import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Tarea;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import com.Prisma.PRISMA.repository.ReporteProblemaRepository;
import com.Prisma.PRISMA.repository.TareaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    public TareaController(TareaRepository tareaRepository, TiendaRepository tiendaRepository,
                           SimpMessagingTemplate mensajeria, AsignarTiendaRepository asignarTiendaRepository) {
        this.tareaRepository = tareaRepository;
        this.tiendaRepository = tiendaRepository;
        this.mensajeria = mensajeria;
        this.asignarTiendaRepository = asignarTiendaRepository;
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

    // POST /api/tareas/cadena {nombreTarea, tipo, cadena}
    // Crea una tarea por cada promotor asignado a cualquier sucursal de esa cadena
    @PostMapping("/cadena")
    public ResponseEntity<?> crearPorCadena(@RequestBody TareaCadena body) {
        if (body.cadena() == null || body.cadena().isBlank()) return ResponseEntity.badRequest().body("Falta la tienda");
        if (body.nombreTarea() == null || body.nombreTarea().isBlank()) return ResponseEntity.badRequest().body("Falta la descripción");

        List<Tienda> sucursales = tiendaRepository.findByNombreIgnoreCase(body.cadena().trim());
        if (sucursales.isEmpty()) return ResponseEntity.badRequest().body("La tienda no esta registrada");

        List<Tarea> creadas = new ArrayList<>();
        Set<String> promotores = new LinkedHashSet<>();
        for (Tienda sucursal : sucursales) {
            for (AsignarTienda asignacion : asignarTiendaRepository.findByTienda_IdTienda(sucursal.getIdTienda())) {
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

        if (creadas.isEmpty()) return ResponseEntity.badRequest().body("Ningún promotor tiene asignada esa tienda");
        return ResponseEntity.ok(Map.of("creadas", creadas.size(), "promotores", promotores));
    }

    // Aviso en vivo solo al promotor de la tarea (igual que el chat: /user/queue/...)
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
            return ResponseEntity.ok(tareaRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());

    }


}