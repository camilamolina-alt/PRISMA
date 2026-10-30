package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")

public class ProductoController {
    private final ProductRepository productRepository;
    public ProductoController(ProductRepository productRepository){
        this.productRepository = productRepository;
    }
    @PostMapping("/{id}/imagen")
    public ResponseEntity<?> subirImag(@PathVariable Long id, @RequestParam("imagen")MultipartFile imagen){
        if (imagen.isEmpty()){
            return ResponseEntity.badRequest().body("No hay imagen");
        }

        String tipo = imagen.getContentType();
        String extens;
        if("image/jpeg".equals(tipo)) extens="jpg";
        else if ("image/png".equals(tipo)) extens ="png";
        else return ResponseEntity.badRequest().body("La imagen debe ser JPG o PNG");

        return productRepository.findById(id).<ResponseEntity<?>>map(producto -> {
            try{
                Path carpeta = Path.of("uploads", "productos");
                Files.createDirectories(carpeta);

                String nombre = id + "-" + System.currentTimeMillis() + "." + extens;
                Files.copy(imagen.getInputStream(), carpeta.resolve(nombre));

                producto.setImageUrl("/uploads/productos/" + nombre);
                return ResponseEntity.ok(productRepository.save(producto));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("No se pudo guardar la imagen");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
