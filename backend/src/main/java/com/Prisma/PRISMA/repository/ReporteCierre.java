package com.Prisma.PRISMA.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reporteCierre")
public class ReporteCierre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    private Integer precision;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(nullable = false)
    private Boolean confirmado;

    private LocalDateTime fechaEnvio;

    @Column(nullable = false)
    private String rutaFoto;

    public ReporteCierre() {

    }
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public Double getLatitud() {
        return latitud;
    }
    public Double getLongitud() {
        return longitud;
    }
    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }
    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }
    public Integer getPrecision() {
        return precision;
    }
    public void setPrecision(Integer precision) {
        this.precision = precision;
    }
    public String getComentario() {
        return comentario;
    }
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    public Boolean getConfirmado() {
        return confirmado;
    }
    public void setConfirmado(Boolean confirmado) {
        this.confirmado = confirmado;
    }
    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }
    public void setFechaEnvio(LocalDateTime fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }
    public String getRutaFoto() {
        return rutaFoto;
    }
    public void setRutaFoto(String rutaFoto) {
        this.rutaFoto = rutaFoto;
    }
}
