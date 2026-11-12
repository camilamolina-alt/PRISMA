package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Tarea {
    private LocalDateTime fecha;
    @PrePersist
    public void prePersist(){
        if(fecha == null ) fecha = LocalDateTime.now();
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long idTarea;

    @ManyToOne(optional = false)
    @JoinColumn(name="id_tienda")
    private Tienda tienda;

    @Column(nullable = false)
    private String tipo;
    @Column (nullable = false)
    private String nombreTarea;
    @Column(nullable = false)
    private String correoPromotor;
    @Column(nullable = false)
    private boolean checkTarea;

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Long getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Long idTarea) {
        this.idTarea = idTarea;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNombreTarea() {
        return nombreTarea;
    }

    public void setNombreTarea(String nombreTarea) {
        this.nombreTarea = nombreTarea;
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

    public boolean isCheckTarea() {
        return checkTarea;
    }

    public void setCheckTarea(boolean checkTarea) {
        this.checkTarea = checkTarea;
    }
}
