package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea,Long> {
    List<Tarea> findByCorreoPromotorOrderByFechaDesc(String correoPromotor);
}
