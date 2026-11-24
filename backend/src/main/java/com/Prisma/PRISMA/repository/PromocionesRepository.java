package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.xml.crypto.Data;
import java.time.LocalDate;
import java.util.List;

public interface PromocionesRepository extends JpaRepository<Promocion, Long> {
    List<Promocion> findAllByOrderByDesdeAsc();
    boolean existsByTipoAndTiendaAndDescripAndDesde(String tipo, String tienda, String descrip, LocalDate desde);
}
