package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.ContactosDTO;
import com.Prisma.PRISMA.dto.MensajeDTO;
import com.Prisma.PRISMA.model.Mensaje;
import com.Prisma.PRISMA.repository.MensajeRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatRestController {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final SimpMessagingTemplate mensajeria;

    public ChatRestController(MensajeRepository mensajeRepository,UsuarioRepository usuarioRepository,SimpMessagingTemplate mensajeria) {
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.mensajeria = mensajeria;
    }

    // Lista de chats
    @GetMapping("/contactos")
    public ResponseEntity<List<ContactosDTO>> contactos(Authentication auth) {
        String yo = auth.getName();

        List<ContactosDTO> lista = usuarioRepository.findAll().stream()
                .filter(u -> !u.getCorreo().equals(yo))
                .map(u -> {
                    List<Mensaje> conv = mensajeRepository.conversacion(yo, u.getCorreo());
                    Mensaje ultimo = conv.isEmpty() ? null : conv.get(conv.size() - 1);
                    long noLeidos = mensajeRepository
                            .countByRemitenteAndReceptorAndLeidoFalse(u.getCorreo(), yo);

                    return new ContactosDTO(
                            u.getCorreo(),
                            u.getNombre(),
                            u.getRol(),
                            ultimo != null ? ultimo.getContenido() : null,
                            ultimo != null ? ultimo.getFecha() : null,
                            noLeidos);
                })
                .toList();

        return ResponseEntity.ok(lista);
    }

    //historial por api
    @GetMapping("/{otro:.+}")
    public ResponseEntity<List<MensajeDTO>> conversacion(@PathVariable String otro,Authentication auth) {
        String yo = auth.getName();

        List<MensajeDTO> mensajes = mensajeRepository.conversacion(yo, otro)
                .stream()
                .map(MensajeDTO::from)
                .toList();

        return ResponseEntity.ok(mensajes);
    }
}