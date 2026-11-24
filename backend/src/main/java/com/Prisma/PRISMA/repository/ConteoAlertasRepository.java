package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.ConteoAlertas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface ConteoAlertasRepository extends JpaRepository<ConteoAlertas, LocalDate> {
}
