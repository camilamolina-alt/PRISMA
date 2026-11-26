package com.Prisma.PRISMA.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Importar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idImportar;

    @Column(nullable = false)
    private String nombreArchivo;
    @Column(nullable = false)
    private String tipo;
    @Column(nullable = false)
    private String correoUsuario;
    @Column(length = 1000)
    private String mensaje;
    @Column(nullable = false)
    private boolean oki;
    @Column(nullable = false)
    private LocalDateTime fecha;

    @JsonIgnore
    @Column(columnDefinition = "bytea")
    private byte[] archivo;

    public Long getIdImportar() {
        return idImportar;
    }

    public void setIdImportar(Long idImportar) {
        this.idImportar = idImportar;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getCorreoUsuario() {
        return correoUsuario;
    }

    public void setCorreoUsuario(String correoUsuario) {
        this.correoUsuario = correoUsuario;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public boolean isOki() {
        return oki;
    }

    public void setOki(boolean oki) {
        this.oki = oki;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public byte[] getArchivo() {
        return archivo;
    }

    public void setArchivo(byte[] archivo) {
        this.archivo = archivo;
    }
}
