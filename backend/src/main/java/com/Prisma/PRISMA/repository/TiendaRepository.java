package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Tienda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TiendaRepository extends JpaRepository<Tienda, Long> {
    Optional<Tienda> findByNombreIgnoreCaseAndUbicacionIgnoreCase(String nombre, String ubicacion);

    List<Tienda> findByNombreIgnoreCase(String nombre);
}