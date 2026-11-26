package com.Prisma.PRISMA.controller;


import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Envio;
import com.Prisma.PRISMA.model.EnvioDetalle;
import com.Prisma.PRISMA.model.EstadoEnvio;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.EnvioDetalleRepository;
import com.Prisma.PRISMA.repository.EnvioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/envios")
@CrossOrigin(origins = "*")
public class EnvioController {
    private final EnvioRepository envioRepository;
    private final EnvioDetalleRepository envioDetalleRepository;
    private final AsignarTiendaRepository asignarTiendaRepository;
    private final SimpMessagingTemplate mensajeria;

    public EnvioController(EnvioRepository envioRepository, EnvioDetalleRepository envioDetalleRepository, AsignarTiendaRepository asignarTiendaRepository, SimpMessagingTemplate mensajeria) {
        this.envioDetalleRepository = envioDetalleRepository;
        this.envioRepository = envioRepository;
        this.asignarTiendaRepository = asignarTiendaRepository;
        this.mensajeria = mensajeria;
    }

    public record CambioEstado(EstadoEnvio estado, String motivo, LocalDate nuevaLlegada) {
    }

    @GetMapping
    public List<Envio> todos() {
        return envioRepository.findAllByOrderByAproxLlegadaAsc();
    }

    @GetMapping("/tienda/{idTienda}")
    public List<Envio> porTienda(@PathVariable Long idTienda) {
        return envioRepository.findByTienda_IdTiendaOrderByAproxLlegadaAsc(idTienda);
    }

    @GetMapping("/{id}/detalle")
    public List<EnvioDetalle> detalle(@PathVariable Long id) {
        return envioDetalleRepository.findByEnvio_IdEnvio(id);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody CambioEstado body) {
        Envio envio = envioRepository.findById(id).orElse(null);
        if (envio == null) {
            return ResponseEntity.notFound().build();
        }
        envio.setEstado(body.estado());
        envio.setMotivo(body.motivo());
        if (body.nuevaLlegada() != null) {
            envio.setAproxLlegada(body.nuevaLlegada());
        }
        Envio guardado = envioRepository.save(envio);

        for (AsignarTienda asignacion : asignarTiendaRepository.findByTienda_IdTienda(guardado.getTienda().getIdTienda())) {
            mensajeria.convertAndSendToUser(asignacion.getCorreoPromotor(), "/queue/alertas", new AlertaDTO(
                    guardado.getTienda().getIdTienda(),
                    guardado.getTienda().getNombre() + ": " + guardado.getEstado(),
                    "envio",
                    null,
                    LocalDateTime.now()
            ));
        }
        return ResponseEntity.ok(guardado);

    }
}



