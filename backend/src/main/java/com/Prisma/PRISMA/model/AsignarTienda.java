package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

@Entity
public class AsignarTienda {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Long idAsignacionTienda;

    @Column(nullable = false)
    private String correoPromotor;


    @ManyToOne(optional = false)
    @JoinColumn(name="id_tienda")
    private Tienda tienda;

    public Long getIdAsignacionTienda() {
        return idAsignacionTienda;
    }

    public void setIdAsignacionTienda(Long idAsignacionTienda) {
        this.idAsignacionTienda = idAsignacionTienda;
    }

    public String getCorreoPromotor() {
        return correoPromotor;
    }

    public void setCorreoPromotor(String correoPromotor) {
        this.correoPromotor = correoPromotor;
    }

    public Tienda getTienda() {
        return tienda;
    }

    public void setTienda(Tienda tienda) {
        this.tienda = tienda;
    }
}
