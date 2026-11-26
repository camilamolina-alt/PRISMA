package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.EnvioDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnvioDetalleRepository extends JpaRepository<EnvioDetalle, Long> {
    List<EnvioDetalle> findByEnvio_IdEnvio(Long idEnvio);

    Optional<EnvioDetalle> findByEnvio_IdEnvioAndProducto_Sku(Long idEnvio, String sku);
}
