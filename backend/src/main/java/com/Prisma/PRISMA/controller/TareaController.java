package com.Prisma.PRISMA.controller;


import com.Prisma.PRISMA.model.Tarea;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import com.Prisma.PRISMA.repository.ReporteProblemaRepository;
import com.Prisma.PRISMA.repository.TareaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class TareaController {
    private final TareaRepository tareaRepository;
    private final TiendaRepository tiendaRepository;

    public TareaController(TareaRepository tareaRepository, TiendaRepository tiendaRepository) {
        this.tareaRepository = tareaRepository;
        this.tiendaRepository = tiendaRepository;
    }


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
        return ResponseEntity.ok(tareaRepository.save(tarea));

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