package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
public class Envio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEnvio;
    @ManyToOne(optional = false)
    @JoinColumn(name ="id_tienda")
    private Tienda tienda;
    @Enumerated(EnumType.STRING)
    private EstadoEnvio estado;
    private LocalDate fechaEnvio;
    private LocalDate aproxLlegada;

    private String motivo;

    public Long getIdEnvio() {
        return idEnvio;
    }

    public void setIdEnvio(Long idEnvio) {
        this.idEnvio = idEnvio;
    }

    public Tienda getTienda() {
        return tienda;
    }

    public void setTienda(Tienda tienda) {
        this.tienda = tienda;
    }

    public EstadoEnvio getEstado() {
        return estado;
    }

    public void setEstado(EstadoEnvio estado) {
        this.estado = estado;
    }

    public LocalDate getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(LocalDate fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    public LocalDate getAproxLlegada() {
        return aproxLlegada;
    }

    public void setAproxLlegada(LocalDate aproxLlegada) {
        this.aproxLlegada = aproxLlegada;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
