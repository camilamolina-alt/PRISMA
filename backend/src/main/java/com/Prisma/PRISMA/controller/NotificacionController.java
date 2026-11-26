package com.Prisma.PRISMA.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificacionController {

    @MessageMapping("/sendMessage")
    @SendTo("/topic/notificacion")

    public String sendMessage (String message){
        System.out.println("message :" + message);
        return message;
    }


}
