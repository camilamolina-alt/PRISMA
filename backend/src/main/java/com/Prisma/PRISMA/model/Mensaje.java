package com.Prisma.PRISMA.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Mensaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMensaje;

    @Column(nullable = false)
    private String remitente;

    @Column(nullable = false)
    private String receptor;

    @Column(nullable = false, columnDefinition = "TEXT")  //tiene que mandar en TEXT o se bugea, es para textos largos
    private String contenido;

    private LocalDateTime fecha;
    private Boolean leido = false;

    public Mensaje(){
    }

    @PrePersist
    public void prePersist(){
        if (fecha == null) fecha = LocalDateTime.now();
        if (leido == null) leido = false;
    }

    public Long getIdMensaje(){
        return idMensaje;
    }
    public void setIdMensaje(Long idMensaje){
        this.idMensaje = idMensaje;
    }

    public String getRemitente(){
        return remitente;
    }
    public void setRemitente(String remitente){
        this.remitente = remitente;
    }

    public String getReceptor(){
        return receptor;
    }
    public void setReceptor(String receptor){
        this.receptor = receptor;
    }

    public String getContenido(){
        return contenido;
    }
    public void setContenido(String contenido){
        this.contenido = contenido;
    }

    public LocalDateTime getFecha(){
        return fecha;
    }
    public void setFecha(LocalDateTime fecha){
        this.fecha = fecha;
    }

    public Boolean getLeido(){
        return leido;
    }
    public void setLeido(Boolean leido){
        this.leido = leido;
    }
}