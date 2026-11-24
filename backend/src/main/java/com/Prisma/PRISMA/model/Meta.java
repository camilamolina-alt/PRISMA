package com.Prisma.PRISMA.model;

import jakarta.persistence.*;

@Entity
public class Meta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMeta;

    @Column(nullable = false)
    private String correoPromotor;

    @ManyToOne(optional = false)
    private Tienda tienda;

    private String departamento;

    @Column(nullable = false)
    private String periodo;

    private Long meta;
    private Long venta;
    private Long bono;

    public Meta() {
    }

    public Long getIdMeta() { return idMeta; }
    public void setIdMeta(Long idMeta) { this.idMeta = idMeta; }

    public String getCorreoPromotor() { return correoPromotor; }
    public void setCorreoPromotor(String correoPromotor) { this.correoPromotor = correoPromotor; }

    public Tienda getTienda() { return tienda; }
    public void setTienda(Tienda tienda) { this.tienda = tienda; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Long getMeta() { return meta; }
    public void setMeta(Long meta) { this.meta = meta; }

    public Long getVenta() { return venta; }
    public void setVenta(Long venta) { this.venta = venta; }

    public Long getBono() { return bono; }
    public void setBono(Long bono) { this.bono = bono; }
}
