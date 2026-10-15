package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.UsuarioDTO;
import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public record LoginRequest(String correo, String contrasena) {}

    @GetMapping
    public List<UsuarioDTO> getUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(u -> new UsuarioDTO(u.getIdUsuario(), u.getNombre(), u.getCorreo(), u.getRol()))
                .toList();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.correo(), request.contrasena)
            );

            Usuario u = usuarioRepository.findByCorreo(request.correo()).orElseThrow();

            String credenciales = request.correo() + ":" + request.contrasena;
            String basicToken = "Basic " + Base64.getEncoder().encodeToString(credenciales.getBytes(StandardCharsets.UTF_8));

            return ResponseEntity.ok(Map.of(
                    "id", u.getIdUsuario(),
                    "correo", u.getCorreo(),
                    "rol", u.getRol().toLowerCase(),
                    "token", basicToken
            ));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Correo o contraseña incorrectos"));
        }
    }

    @PostMapping("/registro")
    public UsuarioDTO registrar(@RequestBody Usuario nuevo) {
        nuevo.setContrasena(passwordEncoder.encode(nuevo.getContrasena()));
        nuevo.setRol(nuevo.getRol().toLowerCase());
        Usuario guardado = usuarioRepository.save(nuevo);
        return new UsuarioDTO(guardado.getIdUsuario(), guardado.getNombre(), guardado.getCorreo(), guardado.getRol());
    }
}