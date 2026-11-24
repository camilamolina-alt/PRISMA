package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Promocion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPromo;

    @Column(nullable = false)
    private String tipo;
    @Column(nullable = false)
    private String tienda;

    private String sku;



    @Column(nullable = false)
    private String descrip;
    private Integer precioNorm;
    private Integer precioProm;

    @Column(nullable = false)
    private LocalDate desde;
    private LocalDate hasta;

    public String getDescrip() {
        return descrip;
    }

    public Long getIdPromo() {
        return idPromo;
    }

    public void setIdPromo(Long idPromo) {
        this.idPromo = idPromo;
    }

    public void setDescrip(String descrip) {
        this.descrip = descrip;
    }

    public Integer getPrecioNorm() {
        return precioNorm;
    }

    public void setPrecioNorm(Integer precioNorm) {
        this.precioNorm = precioNorm;
    }

    public Integer getPrecioProm() {
        return precioProm;
    }

    public void setPrecioProm(Integer precioProm) {
        this.precioProm = precioProm;
    }

    public LocalDate getDesde() {
        return desde;
    }

    public void setDesde(LocalDate desde) {
        this.desde = desde;
    }

    public LocalDate getHasta() {
        return hasta;
    }

    public void setHasta(LocalDate hasta) {
        this.hasta = hasta;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTienda() {
        return tienda;
    }

    public void setTienda(String tienda) {
        this.tienda = tienda;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}
