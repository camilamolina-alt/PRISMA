import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../config/api";
import { useAuthSession } from "../providers/AuthProvider";

const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

export type Mensaje = {
    idMensaje: number;
    remitente: string;
    receptor: string;
    contenido: string;
    fecha: string;
    leido: boolean;
};

export function useChat(otro: string) {
    const { token } = useAuthSession();
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [conectado, setConectado] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
    console.log("useChat →", { otro, hayToken: !!token });
    if (!token || !otro) return;

    const marcar = () =>
        fetch(`${API_URL}/api/chat/${encodeURIComponent(otro)}/leido`, {
        headers: { Authorization: token },
        method: "PUT",
    }).catch(() => {});

    fetch(`${API_URL}/api/chat/${encodeURIComponent(otro)}`, {
        headers: { Authorization: token },
    })
        .then((r) => (r.ok ? r.json() : []))
        .then(setMensajes)
        .then(marcar)
        .catch(() => {});

    const client = new Client({
        debug: (str) => console.log("CHAT:", str),
        brokerURL: WS_URL,
        connectHeaders: { Authorization: token },
        reconnectDelay: 5000,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        onConnect: () => {
        setConectado(true);

        client.subscribe("/user/queue/mensajes", (frame) => {
            const msg: Mensaje = JSON.parse(frame.body);
            const esEsteChat = msg.remitente === otro || msg.receptor === otro;
            if (!esEsteChat) return;

            setMensajes((prev) =>
            prev.some((m) => m.idMensaje === msg.idMensaje)
                ? prev
                : [...prev, msg]
            );
            if (msg.remitente === otro) marcar();
        }); 

        client.subscribe("/user/queue/leidos", (frame) => {
            const { lector } = JSON.parse(frame.body);
            if (lector !== otro) return;

            setMensajes((prev) =>
            prev.map((m) =>
                m.receptor === lector ? { ...m, leido: true } : m
        )
            
            
            );
        });
        },
        onWebSocketClose: () => setConectado(false),
        onStompError: (f) => console.log("STOMP chat:", f.headers["message"]),
    });

    client.activate();
    clientRef.current = client;

    return () => {
        client.deactivate()
        ;
        clientRef.current = null;
    };
    }, [token, otro]);

    const enviarMensaje = useCallback(
        (texto: string) => {
        const limpo = texto.trim();
        if (!limpo || !clientRef.current?.connected) return;

        clientRef.current.publish({
        destination: "/app/chat.enviar",
        body: JSON.stringify({ receptor: otro, contenido: limpo }),
        });
    },
    [otro]
    );

    return { mensajes, conectado, enviarMensaje };
}