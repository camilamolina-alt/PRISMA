package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.ConteoAlertas;
import com.Prisma.PRISMA.model.Tarea;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.ConteoAlertasRepository;
import com.Prisma.PRISMA.repository.StockRepository;
import com.Prisma.PRISMA.repository.TareaRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/indicadores")
@CrossOrigin(origins = "*")
public class IndicadoresController {
    private final TareaRepository tareaRepository;
    private final AsignarTiendaRepository asignarTiendaRepository;
    private final StockRepository stockRepository;
    private final ConteoAlertasRepository conteoAlertasRepository;
    private final UsuarioRepository usuarioRepository;

    public IndicadoresController(TareaRepository tareaRepository, AsignarTiendaRepository asignarTiendaRepository, StockRepository stockRepository, ConteoAlertasRepository conteoAlertasRepository, UsuarioRepository usuarioRepository) {
        this.tareaRepository = tareaRepository;
        this.asignarTiendaRepository = asignarTiendaRepository;
        this.stockRepository = stockRepository;
        this.conteoAlertasRepository = conteoAlertasRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public record Cumplimiento(int completadas, int asignadas, int porcentaje) {}
    public record StockCritico(int hoy, Integer ayer, Integer variacion) {}
    public record RutaPromotor(String correo, String nombre, int visitadas, int asignadas, int porcentaje) {}
    public record TareasTienda(Long idTienda, String nombre, String ubicacion, int completadas, int asignadas, int porcentaje) {}
    public record Indicadores(Cumplimiento zona, StockCritico stockCritico, List<RutaPromotor> rutas, List<TareasTienda> tiendas) {}

    @GetMapping
    public Indicadores indicadores(Authentication auth) {
        LocalDate hoy = LocalDate.now();
        Set<String> equipo = equipoDe(auth);
        List<Tarea> jornada = tareaRepository.findAll().stream()
                .filter(t -> equipo.contains(t.getCorreoPromotor()))
                .filter(t -> !t.isCheckTarea() || hechaHoy(t, hoy))
                .toList();

        int completadas = (int) jornada.stream().filter(Tarea::isCheckTarea).count();
        Cumplimiento zona = new Cumplimiento(completadas, jornada.size(), porcentaje(completadas, jornada.size()));

        return new Indicadores(zona, stockCritico(hoy), rutas(jornada, equipo), tiendas(jornada));
    }

    private Set<String> equipoDe(Authentication auth) {
        String miZona = auth == null ? null : usuarioRepository.findByCorreo(auth.getName())
                .filter(u -> "supervisor".equalsIgnoreCase(u.getRol()))
                .map(Usuario::getZona)
                .orElse(null);
        Set<String> correos = new HashSet<>();
        for (Usuario u : usuarioRepository.findByRol("promotor")) {
            if (miZona == null || miZona.equalsIgnoreCase(u.getZona())) correos.add(u.getCorreo());
        }
        return correos;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void guardarConteoDelDia() {
        guardarConteo(LocalDate.now(), stockRepository.findTodosCriticos().size());
    }

    private StockCritico stockCritico(LocalDate hoy) {
        int alertasHoy = stockRepository.findTodosCriticos().size();
        guardarConteo(hoy, alertasHoy);

        Integer alertasAyer = conteoAlertasRepository.findById(hoy.minusDays(1))
                .map(ConteoAlertas::getCantidad)
                .orElse(null);
        Integer variacion = alertasAyer == null || alertasAyer == 0
                ? null
                : (int) Math.round((alertasHoy - alertasAyer) * 100.0 / alertasAyer);
        return new StockCritico(alertasHoy, alertasAyer, variacion);
    }

    private void guardarConteo(LocalDate fecha, int cantidad) {
        ConteoAlertas conteo = conteoAlertasRepository.findById(fecha).orElseGet(ConteoAlertas::new);
        conteo.setFecha(fecha);
        conteo.setCantidad(cantidad);
        conteoAlertasRepository.save(conteo);
    }

    private List<RutaPromotor> rutas(List<Tarea> jornada, Set<String> equipo) {
        Map<String, String> nombres = new HashMap<>();
        for (Usuario u : usuarioRepository.findAll()) {
            if ("promotor".equalsIgnoreCase(u.getRol()) && equipo.contains(u.getCorreo())) nombres.put(u.getCorreo(), u.getNombre());
        }

        Map<String, Set<Long>> asignadas = new HashMap<>();
        for (AsignarTienda a : asignarTiendaRepository.findAll()) {
            asignadas.computeIfAbsent(a.getCorreoPromotor(), c -> new HashSet<>()).add(a.getTienda().getIdTienda());
        }

        List<RutaPromotor> rutas = new ArrayList<>();
        for (Map.Entry<String, String> promotor : nombres.entrySet()) {
            String correo = promotor.getKey();
            Set<Long> enRuta = asignadas.getOrDefault(correo, Set.of());
            Set<Long> visitadas = new HashSet<>();
            for (Tarea t : jornada) {
                if (t.isCheckTarea() && correo.equals(t.getCorreoPromotor()) && enRuta.contains(t.getTienda().getIdTienda())) {
                    visitadas.add(t.getTienda().getIdTienda());
                }
            }
            rutas.add(new RutaPromotor(correo, promotor.getValue(), visitadas.size(), enRuta.size(), porcentaje(visitadas.size(), enRuta.size())));
        }
        rutas.sort(Comparator.comparingInt(RutaPromotor::porcentaje).reversed().thenComparing(RutaPromotor::nombre));
        return rutas;
    }

    private List<TareasTienda> tiendas(List<Tarea> jornada) {
        Map<Long, Tienda> tiendas = new LinkedHashMap<>();
        Map<Long, int[]> cuentas = new HashMap<>();
        for (Tarea t : jornada) {
            Long id = t.getTienda().getIdTienda();
            tiendas.putIfAbsent(id, t.getTienda());
            int[] c = cuentas.computeIfAbsent(id, k -> new int[2]);
            if (t.isCheckTarea()) c[0]++;
            c[1]++;
        }

        List<TareasTienda> lista = new ArrayList<>();
        for (Tienda tienda : tiendas.values()) {
            int[] c = cuentas.get(tienda.getIdTienda());
            lista.add(new TareasTienda(tienda.getIdTienda(), tienda.getNombre(), tienda.getUbicacion(), c[0], c[1], porcentaje(c[0], c[1])));
        }
        lista.sort(Comparator.comparingInt(TareasTienda::porcentaje).reversed().thenComparing(TareasTienda::nombre));
        return lista;
    }

    private boolean hechaHoy(Tarea t, LocalDate hoy) {
        return t.getFechaCheck() != null && t.getFechaCheck().toLocalDate().equals(hoy);
    }

    private int porcentaje(int parte, int total) {
        return total == 0 ? 0 : (int) Math.round(parte * 100.0 / total);
    }
}
