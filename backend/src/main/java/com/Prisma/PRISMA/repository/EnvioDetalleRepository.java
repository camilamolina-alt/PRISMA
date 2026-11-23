package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.EnvioDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvioDetalleRepository extends JpaRepository<EnvioDetalle, Long> {
    List<EnvioDetalle> findByEnvio_IdEnvio(Long idEnvio);
}
