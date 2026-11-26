package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Envio;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EnvioRepository extends JpaRepository<Envio, Long> {
    List<Envio> findByTienda_IdTiendaOrderByAproxLlegadaAsc(Long idTienda);
    Optional<Envio>findByTienda_IdTiendaAndFechaEnvio(Long idTienda, LocalDate fechaEnvio);
    List<Envio> findAllByOrderByAproxLlegadaAsc();
}
