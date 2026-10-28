import {Client} from "@stomp/stompjs";
import {useCallback , useEffect, useRef, useState} from "react";
import {API_URL} from "../config/api";
import {useAuthSession} from "../providers/AuthProvider";

const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

export type Mensaje ={
    idMensaje: number;
    remitente: string;
    receptor: string;
    contenido: string;
    fecha: string;
    leido: boolean
};

export function useChat(otro : string) {
    const {token} = useAuthSession();
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [conectado, setConectado] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
    console.log("useChat →", { otro, hayToken: !!token });
    if (!token || !otro)
        return;
        
        if (!token || !otro) 
            return;
        fetch(`${API_URL}/api/chat/${encodeURIComponent(otro)}`, {
            headers: {Authorization: token},
        })
    .then((r) => (r.ok ? r.json() : []))
    .then(setMensajes)
    .catch(() => {});
    
    const client = new Client({debug: (str) => console.log("CHAT:", str),
        brokerURL: WS_URL ,
        
        connectHeaders: {Authorization: token},
        reconnectDelay: 5000,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        onConnect: () => {
            setConectado(true);
            client.subscribe("/user/queue/mensajes", (frame) => {
                const msg: Mensaje = JSON.parse(frame.body);
                const esEsteChat = msg.remitente === otro || msg.receptor === otro;
                if (!esEsteChat) 
                    return;

                setMensajes((prev) =>
                    prev.some((m) => m.idMensaje === msg.idMensaje) ? prev : [...prev, msg]
            );
            });
        },
        onWebSocketClose: () => setConectado(false), onStompError: (f) => console.log("STOMMP chat:", f.headers["message"]),
    });
    client.activate();
    clientRef.current = client;
    return () => {
        client.deactivate();
        clientRef.current = null;
    };
    }, [token, otro]);

    const enviarMensaje = useCallback(
        (texto: string) => {
            const limpo = texto.trim();
            if (!limpo || !clientRef.current?.connected) 
                return;
            clientRef.current.publish({
                destination: "/app/chat.enviar",
                body: JSON.stringify({receptor: otro, contenido: limpo}),
            });
        },
        [otro] 
    );
    return {mensajes, conectado, enviarMensaje};
}