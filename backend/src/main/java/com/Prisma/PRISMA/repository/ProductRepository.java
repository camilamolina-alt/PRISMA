package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Producto, Long>{
}
