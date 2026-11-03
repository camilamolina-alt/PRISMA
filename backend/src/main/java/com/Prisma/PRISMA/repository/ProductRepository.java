package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySku(String sku);
}
