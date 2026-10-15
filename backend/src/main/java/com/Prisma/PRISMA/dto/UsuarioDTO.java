package com.Prisma.PRISMA.dto;

import java.util.UUID;

public record UsuarioDTO(UUID id, String name, String correo, String rol) {
}