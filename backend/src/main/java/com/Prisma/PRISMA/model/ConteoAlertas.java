package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class ConteoAlertas {
    @Id
    private LocalDate fecha;

    @Column(nullable = false)
    private int cantidad;

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}
