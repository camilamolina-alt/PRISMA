package com.Prisma.PRISMA.model;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"id_producto", "id_tienda"}))

public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idStock;

    @ManyToOne(optional = false)
    @JoinColumn(name ="id_producto")

    private Producto producto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tienda")

    private Tienda tienda;
    private Integer cant_sala;
    private Integer cant_enviada;
    private Integer stock_critico;
    private LocalDateTime act_sala;
    private LocalDateTime act_planilla;

    public Stock() {
    }

    public Long getIdStock() {
        return  idStock;
    }
    public void setIdStock(Long idStock){
        this.idStock = idStock;
    }

    public Producto getProducto(){
        return producto;
    }
    public void setProducto(Producto producto){
        this.producto = producto;
    }

    public Tienda getTienda(){
        return tienda;
    }

    public void setTienda(Tienda tienda){
        this.tienda = tienda;
    }

    public Integer getCant_sala(){
        return cant_sala;
    }

    public void setCant_sala(Integer cantSala){
        this.cant_sala = cantSala;
    }

    public Integer getCant_enviada(){
        return cant_enviada;
    }

    public void setCant_enviada(Integer cant_enviada){
        this.cant_enviada = cant_enviada;
    }

    public Integer getStock_critico(){
        return stock_critico;
    }
    public void setStock_critico(Integer stock_critico){
        this.stock_critico = stock_critico;
    }

    public LocalDateTime getAct_sala(){
        return  act_sala;
    }

    public void setAct_sala(LocalDateTime act_sala){
        this.act_sala = act_sala;
    }

    public LocalDateTime getAct_planilla() {
        return act_planilla;
    }

    public void setAct_planilla(LocalDateTime act_planilla) {
        this.act_planilla = act_planilla;
    }

}
