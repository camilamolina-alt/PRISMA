package com.Prisma.PRISMA.dto;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.Prisma.PRISMA.repository.MensajeRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;


import java.time.LocalDateTime;
import java.util.List;

public record ContactosDTO(
        String correo,
        String nombre,
        String rol,
        String ultimo,
        LocalDateTime fecha,
        Long noleido
) {
    }