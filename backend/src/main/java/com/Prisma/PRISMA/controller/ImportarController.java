package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.service.EnvioLectura;
import com.Prisma.PRISMA.model.Importar;
import com.Prisma.PRISMA.repository.ImportarRepository;
import com.Prisma.PRISMA.service.Excellectura;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/importaciones")
@CrossOrigin(origins = "*")
public class ImportarController {
    //para el excel
    private final Excellectura excellectura;
    private final ImportarRepository importarRepository;
    private final EnvioLectura envioLectura;

    public ImportarController(Excellectura excellectura, ImportarRepository importarRepository, EnvioLectura envioLectura) {
        this.excellectura = excellectura;
        this.importarRepository = importarRepository;
        this.envioLectura = envioLectura;
    }

    @PostMapping
    public ResponseEntity<?> importa(@RequestParam("archivo") MultipartFile archi, Authentication auth) throws IOException {
        if (archi.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay archivo");
        }
        Importar registro = new Importar();
        registro.setNombreArchivo(archi.getOriginalFilename());
        registro.setTipo("tiendas");
        registro.setCorreoUsuario(auth.getName());
        registro.setFecha(LocalDateTime.now());
        registro.setArchivo(archi.getBytes());

        try {
            excellectura.importe(archi);
            registro.setOki(true);
            registro.setMensaje("Se importó correctamente la planilla");
        } catch (RuntimeException e) {
            registro.setOki(false);
            registro.setMensaje(e.getMessage());
        } catch (Exception e) {
            registro.setOki(false);
            registro.setMensaje("No se puede leer el archivo. Solo se aceptan Excel");
        }

        importarRepository.save(registro);

        return registro.isOki()
                ? ResponseEntity.ok(registro.getMensaje())
                : ResponseEntity.badRequest().body(registro.getMensaje());

    }


    @GetMapping
    public List<Importar> lista() {
        return importarRepository.findAllByOrderByFechaDesc();
    }

    @PostMapping("/envios")
    public ResponseEntity<?> importaEnvios(@RequestParam("archivo") MultipartFile archi, Authentication auth) throws IOException {
        if (archi.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay archivo");
        }
        Importar registro = new Importar();
        registro.setNombreArchivo(archi.getOriginalFilename());
        registro.setTipo("envios");
        registro.setCorreoUsuario(auth.getName());
        registro.setFecha(LocalDateTime.now());
        registro.setArchivo(archi.getBytes());

        try {
            envioLectura.importe(archi);
            registro.setOki(true);
            registro.setMensaje("Se importó correctamente la planilla de envíos");
        } catch (RuntimeException e) {
            registro.setOki(false);
            registro.setMensaje(e.getMessage());
        } catch (Exception e) {
            registro.setOki(false);
            registro.setMensaje("No se puede leer el archivo. Solo se aceptan Excel");
        }

        importarRepository.save(registro);

        return registro.isOki()
                ? ResponseEntity.ok(registro.getMensaje())
                : ResponseEntity.badRequest().body(registro.getMensaje());
    }


    @GetMapping("/{id}/archivo")
    public ResponseEntity<byte[]> archivo(@PathVariable Long id) {
        Importar registro = importarRepository.findById(id).orElse(null);
        if (registro == null || registro.getArchivo() == null) {
            return ResponseEntity.notFound().build();

        }

        String nombre = registro.getNombreArchivo();
        String tipo = nombre.toLowerCase().endsWith(".xls")
                ? "application/vnd.ms-excel"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(tipo))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(nombre, StandardCharsets.UTF_8).build().toString())
                .body(registro.getArchivo());
    }
}