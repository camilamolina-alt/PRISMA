package com.Prisma.PRISMA.service;

import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Meta;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.model.Usuario;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.MetaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import com.Prisma.PRISMA.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class MetasDePrueba implements CommandLineRunner {
    private static final String[] DEPARTAMENTOS = {"ADULTO", "JUNIOR", "KID"};

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TiendaRepository tiendaRepository;
    private final AsignarTiendaRepository asignarTiendaRepository;

    public MetasDePrueba(MetaRepository metaRepository, UsuarioRepository usuarioRepository,
                         TiendaRepository tiendaRepository, AsignarTiendaRepository asignarTiendaRepository) {
        this.metaRepository = metaRepository;
        this.usuarioRepository = usuarioRepository;
        this.tiendaRepository = tiendaRepository;
        this.asignarTiendaRepository = asignarTiendaRepository;
    }

    @Override
    public void run(String... args) {
        if (metaRepository.count() > 0) return;

        List<Tienda> todas = tiendaRepository.findAll();
        if (todas.isEmpty()) return;

        List<Meta> nuevas = new ArrayList<>();
        int n = 0;
        for (Usuario u : usuarioRepository.findAll()) {
            if (u.getRol() == null || !u.getRol().equalsIgnoreCase("promotor")) continue;


            List<Tienda> tiendas = new ArrayList<>(asignarTiendaRepository.findByCorreoPromotor(u.getCorreo())
                    .stream().map(AsignarTienda::getTienda).toList());
            if (tiendas.isEmpty()) {
                tiendas.add(todas.get(n % todas.size()));
                tiendas.add(todas.get((n + 1) % todas.size()));
            }
            n++;
            Random azar = new Random(u.getCorreo().hashCode());
            double talento = 0.75 + azar.nextDouble() * 0.45;

            for (int mes = 0; mes < 4; mes++) {
                String periodo = YearMonth.now().minusMonths(mes).toString(); // "2026-11"
                for (Tienda t : tiendas) {
                    for (String depto : DEPARTAMENTOS) {
                        long meta = (1 + azar.nextInt(9)) * 1_000_000L;
                        double logro = talento + (azar.nextDouble() - 0.5) * 0.4;
                        long venta = Math.max(0, Math.round(meta * logro / 1000.0) * 1000);

                        Meta m = new Meta();
                        m.setCorreoPromotor(u.getCorreo());
                        m.setTienda(t);
                        m.setDepartamento(depto);
                        m.setPeriodo(periodo);
                        m.setMeta(meta);
                        m.setVenta(venta);
                        // Como en la planilla: sin cumplir la meta no hay bono
                        m.setBono(venta >= meta ? (20 + azar.nextInt(5) * 5) * 1000L : 0L);
                        nuevas.add(m);
                    }
                }
            }
        }
        metaRepository.saveAll(nuevas);
        System.out.println("Metas de prueba creadas: " + nuevas.size());
    }
}
