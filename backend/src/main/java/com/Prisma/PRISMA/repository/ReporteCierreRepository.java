package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.ReporteCierre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReporteCierreRepository extends JpaRepository<ReporteCierre,Long> {
    List<ReporteCierre>findByCorreoPromotorOrderByFechaDesc(String correoPromotor);
}
