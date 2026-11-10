package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByTienda_IdTienda(Long idTienda);

    Optional<Stock> findByProducto_SkuAndTienda_IdTienda(String sku, Long idTienda);

    @Query("Select s from Stock s where s.cant_sala is not null and s.cant_enviada is not null and s.cant_sala *2 < s.cant_enviada")
    List<Stock> findTodosCriticos();

    @Query("Select s from Stock s where s.tienda.idTienda = :idTienda and s.cant_sala is not null and s.cant_enviada is not null and s.cant_sala *2 < s.cant_enviada ")
    List<Stock> findCriticosPorTienda(@Param("idTienda")Long idTienda);
}