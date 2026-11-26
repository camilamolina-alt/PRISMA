package com.Prisma.PRISMA.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Tienda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTienda;

    private String departamento;
    private String ubicacion;

    // Datos
    private String nombre;
    private String adminis;
    private String fono;
    private String direccion;

    public Tienda() {
    }

    public Long getIdTienda() {
        return idTienda;
    }
    public void setIdTienda(Long idTienda) {
        this.idTienda = idTienda;
    }
    public String getDepartamento() {
        return departamento;
    }
    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
    public String getUbicacion() {
        return ubicacion;
    }
    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getAdminis() {
        return adminis;
    }
    public void setAdminis(String adminis) {
        this.adminis = adminis;
    }
    public String getFono() {
        return fono;
    }
    public void setFono(String fono) {
        this.fono = fono;
    }
    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}