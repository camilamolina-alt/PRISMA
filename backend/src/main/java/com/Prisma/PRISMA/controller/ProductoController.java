package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.Producto;
import com.Prisma.PRISMA.repository.ProductRepository;
import org.apache.commons.math3.stat.descriptive.summary.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @PostMapping("/catalogo")
    public ResponseEntity<?> subirCatalogo(@RequestParam("imagenes") List<MultipartFile> imagenes) {
        if (imagenes == null || imagenes.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay imágenes");
        }

        int asociadas = 0;
        List<String> sinProducto = new ArrayList<>();
        List<String> invalidas = new ArrayList<>();

        try {
            Path carpeta = Path.of("uploads", "productos");
            Files.createDirectories(carpeta);

            for (MultipartFile imagen : imagenes) {
                String original = imagen.getOriginalFilename() == null ? "" : imagen.getOriginalFilename();
                int punto = original.lastIndexOf('.');
                if (imagen.isEmpty() || punto <= 0) {
                    invalidas.add(original);
                    continue;
                }

                String sku = original.substring(0, punto).trim();
                String extens = original.substring(punto + 1).toLowerCase();
                if (extens.equals("jpeg")) extens = "jpg";
                if (!extens.equals("jpg") && !extens.equals("png") && !extens.equals("webp")) {
                    invalidas.add(original);
                    continue;
                }

                Optional<Producto> encontrado = productRepository.findBySku(sku);
                if (encontrado.isEmpty()) {
                    sinProducto.add(original);
                    continue;
                }

                Producto producto = encontrado.get();
                String nombre = producto.getIdProducto() + "-" + System.currentTimeMillis() + "." + extens;
                Files.copy(imagen.getInputStream(), carpeta.resolve(nombre));
                producto.setImageUrl("/uploads/productos/" + nombre);
                productRepository.save(producto);
                asociadas++;
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("No se pudieron guardar las imágenes");
        }

        return ResponseEntity.ok(Map.of(
                "asociadas", asociadas,
                "sinProducto", sinProducto,
                "invalidas", invalidas
        ));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<Producto> skuB(@PathVariable String sku){
        return productRepository.findBySku(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
