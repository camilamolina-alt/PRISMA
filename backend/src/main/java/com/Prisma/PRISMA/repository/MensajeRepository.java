package com.Prisma.PRISMA.repository;

import com.Prisma.PRISMA.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensajeRepository extends JpaRepository <Mensaje, Long>{
  //Para ordenar las conversaciones de mas antiguo
    @Query("""
select m from Mensaje m
where (m.remitente = :yo and m.receptor = :otro)
or (m.remitente = :otro and m.receptor = : yo)
order by fecha asc
""")

    List<Mensaje> conversacion(@Param("yo") String yo, @Param("otro") String otro);
    List<Mensaje> findByReceptorAndLeidoFalse(String receptor);
    long countByRemitenteAndReceptorAndLeidoFalse(String remitente, String receptor);
}
