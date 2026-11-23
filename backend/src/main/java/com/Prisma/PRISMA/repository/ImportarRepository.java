package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Importar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportarRepository extends JpaRepository<Importar, Long> {
    List<Importar> findAllByOrderByFechaDesc();
}


