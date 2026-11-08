package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.ReporteCierre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ReporteCierreRepository extends JpaRepository<ReporteCierre, UUID> {
}
