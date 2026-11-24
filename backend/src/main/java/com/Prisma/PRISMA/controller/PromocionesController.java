package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.Promocion;
import com.Prisma.PRISMA.repository.PromocionesRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@CrossOrigin(origins = "*")
public class PromocionesController {
    private final PromocionesRepository promocionesRepository;

    public PromocionesController(PromocionesRepository promocionesRepository) {
        this.promocionesRepository = promocionesRepository;
    }

    @GetMapping
    public List<Promocion> todas() {
        return promocionesRepository.findAllByOrderByDesdeAsc();
    }
}