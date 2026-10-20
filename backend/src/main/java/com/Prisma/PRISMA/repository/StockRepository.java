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

    @Query("SELECT s FROM Stock s WHERE s.cant_sala IS NOT NULL AND s.stock_critico IS NOT NULL AND s.cant_sala <= s.stock_critico")
    List<Stock> findTodosCriticos();


    @Query("SELECT s FROM Stock s WHERE s.tienda.idTienda = :idTienda AND s.cant_sala IS NOT NULL AND s.stock_critico IS NOT NULL AND s.cant_sala <= s.stock_critico")
    List<Stock> findCriticosPorTienda(@Param("idTienda") Long idTienda);
}