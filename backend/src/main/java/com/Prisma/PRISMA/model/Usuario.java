package com.Prisma.PRISMA.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.util.UUID;


@Entity

public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)

    private UUID idUsuario;

    private String nombre;
    private String correo;
    private String contrasena;
    private String rol;

    public Usuario() {
    }
    public UUID getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(UUID idUsuario){
        this.idUsuario = idUsuario;
    }

    public String getNombre(){
        return nombre;
    }

    public void setNombre(String nombre){
        this.nombre = nombre;
    }

    public String getCorreo(){
        return correo;
    }

    public void setCorreo(String correo){
        this.correo = correo;
    }

    public String getContrasena(){
        return  contrasena;
    }

    public void setContrasena(String contrasena){
        this.contrasena = contrasena;
    }

    public String getRol(){
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
