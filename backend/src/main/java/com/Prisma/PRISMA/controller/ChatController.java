package com.Prisma.PRISMA.controller;
import com.Prisma.PRISMA.dto.ContactosDTO;
import com.Prisma.PRISMA.dto.SendMensajeDTO;
import com.Prisma.PRISMA.dto.MensajeDTO;
import com.Prisma.PRISMA.model.Mensaje;
import com.Prisma.PRISMA.repository.MensajeRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;

@Controller
public class ChatController {
    private final MensajeRepository mensajeRepository;
    private final SimpMessagingTemplate mensajeria;

    public ChatController(MensajeRepository mensajeRepository , SimpMessagingTemplate mensajeria){
        this.mensajeRepository = mensajeRepository;

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
    }

       };
