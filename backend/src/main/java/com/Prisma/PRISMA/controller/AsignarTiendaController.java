package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones")
@CrossOrigin(origins = "*")
public class AsignarTiendaController {
    private final AsignarTiendaRepository asignarTiendaRepository;
    private final TiendaRepository tiendaRepository;

    // El constructor se llama igual que la CLASE (Controller), no que el repository
    public AsignarTiendaController(AsignarTiendaRepository asignarTiendaRepository, TiendaRepository tiendaRepository) {
        this.asignarTiendaRepository = asignarTiendaRepository;
        this.tiendaRepository = tiendaRepository;
    }

    public record NuevaAsignacion(String correoPromotor, Long idTienda) {}


    @PostMapping
    public ResponseEntity<?> crear(@RequestBody NuevaAsignacion body) {
        if (body.correoPromotor() == null || body.correoPromotor().isBlank() || body.idTienda() == null) {
            return ResponseEntity.badRequest().body("Falta el promotor o la tienda");
        }

        Tienda tienda = tiendaRepository.findById(body.idTienda()).orElse(null);
        if (tienda == null) return ResponseEntity.badRequest().body("No existe esa tienda");


        if (asignarTiendaRepository.existsByCorreoPromotorAndTienda_IdTienda(body.correoPromotor(), body.idTienda())) {
            return ResponseEntity.badRequest().body("Ese promotor ya tiene esa tienda");
        }

        AsignarTienda asignacion = new AsignarTienda();
        asignacion.setCorreoPromotor(body.correoPromotor());
        asignacion.setTienda(tienda);
        return ResponseEntity.ok(asignarTiendaRepository.save(asignacion));
    }


    @GetMapping
    public List<AsignarTienda> todas() {
        return asignarTiendaRepository.findAll();
    }


    @GetMapping("/mias")
    public List<AsignarTienda> mias(Authentication auth) {
        return asignarTiendaRepository.findByCorreoPromotor(auth.getName());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> quitar(@PathVariable Long id) {
        if (!asignarTiendaRepository.existsById(id)) return ResponseEntity.notFound().build();
        asignarTiendaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
