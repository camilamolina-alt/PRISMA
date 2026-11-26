package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ReporteCierre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReporte;

    @Column(nullable = false)
    private String correoPromotor;

    @Column(nullable = false)
    private String fotoURL;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    private Integer precisionMT;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    private LocalDateTime fecha;
    public ReporteCierre(){}
    @PrePersist
    public void prePersist(){
        if (fecha == null) fecha = LocalDateTime.now();
    }

    public Long getIdReporte() {
        return idReporte;
    }

    public void setIdReporte(Long idReporte) {
        this.idReporte = idReporte;
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

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public Integer getPrecisionMT() {
        return precisionMT;
    }

    public void setPrecisionMT(Integer precisionMT) {
        this.precisionMT = precisionMT;
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
}
