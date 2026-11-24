package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.dto.UsuarioDTO;
import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SimpMessagingTemplate mensajeria;

    public record LoginRequest(String correo, String contrasena) {}
    public record CambioRol(String rol){}
    public record CambioZona(String zona){}

    private UsuarioDTO aDTO(Usuario u) {
        return new UsuarioDTO(u.getIdUsuario(), u.getNombre(), u.getCorreo(), u.getRol(), u.getZona());
    }

    @PutMapping("/{id}/zona")
    public ResponseEntity<?> cambiarZona(@PathVariable UUID id, @RequestBody CambioZona body) {
        return usuarioRepository.findById(id).<ResponseEntity<?>>map(u -> {
            String zona = body.zona() == null || body.zona().isBlank() ? null : body.zona().trim().toLowerCase();
            u.setZona(zona);
            return ResponseEntity.ok(aDTO(usuarioRepository.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mi-equipo")
    public List<UsuarioDTO> miEquipo(Authentication auth) {
        List<Usuario> promotores = usuarioRepository.findByRol("promotor");
        String miZona = usuarioRepository.findByCorreo(auth.getName())
                .filter(u -> "supervisor".equalsIgnoreCase(u.getRol()))
                .map(Usuario::getZona)
                .orElse(null);

        return promotores.stream()
                .filter(p -> miZona == null || miZona.equalsIgnoreCase(p.getZona()))
                .map(this::aDTO)
                .toList();
    }

    @GetMapping
    public List<UsuarioDTO> getUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::aDTO)
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
        return aDTO(guardado);
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<?> rolC(@PathVariable UUID id, @RequestBody CambioRol body, Authentication auth){
        Optional<Usuario> encontrado = usuarioRepository.findById(id);
        if (encontrado.isEmpty()){
            return  ResponseEntity.notFound().build();
        }

        Usuario u = encontrado.get();
        if (auth != null && u.getCorreo().equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.badRequest().body("No puedes cambiar tu propio rol");
        }
        String rolAnterior = u.getRol();
        u.setRol(body.rol().toLowerCase());
        Usuario guardado = usuarioRepository.save(u);
        if (!guardado.getRol().equalsIgnoreCase(rolAnterior)) {
            mensajeria.convertAndSendToUser(guardado.getCorreo(), "/queue/alertas", new AlertaDTO(
                    null, "Tu rol cambió a " + guardado.getRol() + ".",
                    "rol", guardado.getRol(), LocalDateTime.now()));
        }
        return ResponseEntity.ok(aDTO(guardado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarUser(@PathVariable UUID id, Authentication auth){
        Optional<Usuario> encontrado = usuarioRepository.findById(id);
        if (encontrado.isEmpty()){
            return  ResponseEntity.notFound().build();
        }
        if (auth != null && encontrado.get().getCorreo().equalsIgnoreCase(auth.getName())) {
            return ResponseEntity.badRequest().body("No puedes eliminar tu propia cuenta");
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}