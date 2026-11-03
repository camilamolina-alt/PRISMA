package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.service.Excellectura;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/importaciones")
@CrossOrigin(origins = "*")
public class ImportarController {
    //para el excel
    private final Excellectura excellectura;

    public ImportarController(Excellectura excellectura) {
        this.excellectura = excellectura;
    }

    @PostMapping
    public ResponseEntity<?> importa(@RequestParam("archivo") MultipartFile archi) {
        if (archi.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay archivo");
        }

        try {
            excellectura.importe(archi);
            return ResponseEntity.ok("Se importó correctamente la planilla");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("No se puede leer el archivo. Solo se aceptan Excel");
        }
    }
}