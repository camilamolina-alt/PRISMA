package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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

    public TiendaController(TiendaRepository tiendaRepository) {
        this.tiendaRepository = tiendaRepository;
    }

    @GetMapping
    public List<Tienda> listar() {
        return tiendaRepository.findAll();
    }

    @PostMapping
    public Tienda crear(@RequestBody Tienda tienda) {
        return tiendaRepository.save(tienda);
    }
}