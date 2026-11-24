package com.Prisma.PRISMA.service;

import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EquipoService {
    private final UsuarioRepository usuarioRepository;

    public EquipoService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Set<String> correosDelEquipo(String correoSupervisor) {
        String zona = usuarioRepository.findByCorreo(correoSupervisor)
                .filter(u -> "supervisor".equalsIgnoreCase(u.getRol()))
                .map(Usuario::getZona)
                .orElse(null);
        if (zona == null) return null;
        return usuarioRepository.findByRol("promotor").stream()
                .filter(p -> zona.equalsIgnoreCase(p.getZona()))
                .map(Usuario::getCorreo)
                .collect(Collectors.toSet());
    }

    public List<Usuario> supervisoresDe(String correoPromotor) {
        String zona = usuarioRepository.findByCorreo(correoPromotor).map(Usuario::getZona).orElse(null);
        return usuarioRepository.findByRol("supervisor").stream()
                .filter(s -> s.getZona() == null || s.getZona().equalsIgnoreCase(zona))
                .toList();
    }
}
