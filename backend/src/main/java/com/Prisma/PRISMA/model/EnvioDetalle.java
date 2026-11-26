package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

@Entity
public class EnvioDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;
    @ManyToOne(optional = false)
    @JoinColumn(name="id_envio")
    private Envio envio;
    @ManyToOne(optional = false)
    @JoinColumn(name="id_producto")
    private Producto producto;

    private Integer cantidad;

    public Long getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Long idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Envio getEnvio() {
        return envio;
    }

    public void setEnvio(Envio envio) {
        this.envio = envio;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
