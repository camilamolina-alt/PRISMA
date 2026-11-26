package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MetaRepository extends JpaRepository<Meta, Long> {
    List<Meta> findAllByOrderByPeriodoDesc();
    List<Meta> findByCorreoPromotorOrderByPeriodoDesc(String correoPromotor);
}
