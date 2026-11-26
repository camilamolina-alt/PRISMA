package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.AsignarTienda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignarTiendaRepository extends JpaRepository<AsignarTienda, Long>{
    List<AsignarTienda>findByCorreoPromotor(String correoPromotor);
    List<AsignarTienda> findByTienda_IdTienda(Long idTienda);
    boolean existsByCorreoPromotorAndTienda_IdTienda(String correoPromotor, Long idTienda);
}


