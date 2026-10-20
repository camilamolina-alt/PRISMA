package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.TiendaDetalleDTO;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.StockRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tiendas")
@CrossOrigin(origins = "*")
public class TiendaController {

    private final TiendaRepository tiendaRepository;
    private final StockRepository stockRepository;

    public TiendaController(TiendaRepository tiendaRepository, StockRepository stockRepository) {
        this.tiendaRepository = tiendaRepository;
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public List<Tienda> listar() {
        return tiendaRepository.findAll();
    }

    @PostMapping
    public Tienda crear(@RequestBody Tienda tienda) {
        return tiendaRepository.save(tienda);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiendaDetalleDTO> detalle(@PathVariable Long id) {
        return tiendaRepository.findById(id).map(t -> {
            long criticas = stockRepository.findByTienda_IdTienda(id).stream()
                    .filter(s -> s.getCant_sala() != null
                            && s.getStock_critico() != null
                            && s.getCant_sala() <= s.getStock_critico())
                    .count();

            return ResponseEntity.ok(new TiendaDetalleDTO(
                    t.getIdTienda(),
                    t.getNombre(),
                    t.getAdminis(),
                    t.getFono(),
                    t.getDireccion(),
                    t.getDepartamento(),
                    t.getUbicacion(),
                    criticas
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}