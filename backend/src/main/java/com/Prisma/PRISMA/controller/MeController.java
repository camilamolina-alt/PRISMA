package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@CrossOrigin(origins = "*")
public class MeController {


    public record MeResponse(String nombre, String correo, String rol) {
    }

    private final UsuarioRepository usuarioRepository;

    public MeController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<MeResponse> yo(Authentication auth) {
        // auth.getName() es el correo con el que iniciaste sesión
        return usuarioRepository.findByCorreo(auth.getName())
                .map(u -> ResponseEntity.ok(new MeResponse(u.getNombre(), u.getCorreo(), u.getRol())))
                .orElse(ResponseEntity.notFound().build());
    }
}