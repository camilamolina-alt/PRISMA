package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ReporteProblema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProblemas;

    @Column(nullable = false)
    private String correoPromotor;
    @Column(nullable = false)
    private String fotoURL;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comentario;
    private LocalDateTime fecha;

    public ReporteProblema() {
    }

    public Long getIdProblemas() {
        return idProblemas;
    }

    public void setIdProblemas(Long idProblemas) {
        this.idProblemas = idProblemas;
    }

    public String getCorreoPromotor() {
        return correoPromotor;
    }

    public void setCorreoPromotor(String correoPromotor) {
        this.correoPromotor = correoPromotor;
    }

    public String getFotoURL() {
        return fotoURL;
    }

    public void setFotoURL(String fotoURL) {
        this.fotoURL = fotoURL;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    @PrePersist
    public void prePersist() {
        if (fecha == null) fecha = LocalDateTime.now();
    }
}
