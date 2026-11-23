package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.Meta;
import com.Prisma.PRISMA.repository.MetaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
@CrossOrigin(origins = "*")
public class MetaController {
    private final MetaRepository metaRepository;

    public MetaController(MetaRepository metaRepository) {
        this.metaRepository = metaRepository;
    }

    @GetMapping
    public List<Meta> todas() {
        return metaRepository.findAllByOrderByPeriodoDesc();
    }

    // Promotor: solo las suyas
    @GetMapping("/mias")
    public List<Meta> mias(Authentication auth) {
        return metaRepository.findByCorreoPromotorOrderByPeriodoDesc(auth.getName());
    }
}
