package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.dto.ContactosDTO;
import com.Prisma.PRISMA.model.Usuario;
import java.time.LocalDateTime;
import com.Prisma.PRISMA.dto.SendMensajeDTO;
import com.Prisma.PRISMA.dto.MensajeDTO;
import com.Prisma.PRISMA.model.Mensaje;
import com.Prisma.PRISMA.model.ReporteProblema;
import com.Prisma.PRISMA.repository.MensajeRepository;
import com.Prisma.PRISMA.repository.ReporteCierreRepository;
import com.Prisma.PRISMA.repository.ReporteProblemaRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.security.Principal;
import java.util.List;
import java.util.Map;


@Controller
public class ChatController {
    private final MensajeRepository mensajeRepository;
    private final SimpMessagingTemplate mensajeria;
    private final UsuarioRepository usuarioRepository;

    public ChatController(MensajeRepository mensajeRepository, SimpMessagingTemplate mensajeria, UsuarioRepository usuarioRepository) {
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.mensajeria = mensajeria;
    }

    @MessageMapping("/chat.enviar")
    public void enviar(@Payload SendMensajeDTO entrada, Principal principal) {
        if (entrada.contenido() == null || entrada.contenido().isBlank())
            return;

        Mensaje m = new Mensaje();
        m.setRemitente(principal.getName());
        m.setReceptor(entrada.receptor());
        m.setContenido(entrada.contenido().trim());
        Mensaje guardado = mensajeRepository.save(m);
        MensajeDTO dto = MensajeDTO.from(guardado);

        //entraga los mensajes a ambos
        mensajeria.convertAndSendToUser(guardado.getReceptor(), "/queue/mensajes", dto);
        mensajeria.convertAndSendToUser(guardado.getRemitente(), "/queue/mensajes", dto);

        // Aviso para el banner del que recibe. En "producto" va el correo del remitente para abrir su chat
        String nombre = usuarioRepository.findByCorreo(guardado.getRemitente())
                .map(Usuario::getNombre).orElse(guardado.getRemitente());
        mensajeria.convertAndSendToUser(guardado.getReceptor(), "/queue/alertas", new AlertaDTO(
                null, nombre + ": " + guardado.getContenido(), "mensaje", guardado.getRemitente(), LocalDateTime.now()));
    }


};
