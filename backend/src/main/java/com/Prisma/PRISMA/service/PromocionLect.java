package com.Prisma.PRISMA.service;

import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.model.AsignarTienda;
import com.Prisma.PRISMA.model.Promocion;
import com.Prisma.PRISMA.model.Tarea;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.AsignarTiendaRepository;
import com.Prisma.PRISMA.repository.PromocionesRepository;
import com.Prisma.PRISMA.repository.TareaRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Set;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class PromocionLect {
    private final PromocionesRepository promocionesRepository;
    private final TiendaRepository tiendaRepository;
    private final AsignarTiendaRepository asignarTiendaRepository;
    private final TareaRepository tareaRepository;
    private final SimpMessagingTemplate mensajeria;
    private final EquipoService equipoService;

    public PromocionLect(PromocionesRepository promocionesRepository, TiendaRepository tiendaRepository, AsignarTiendaRepository asignarTiendaRepository, TareaRepository tareaRepository, SimpMessagingTemplate mensajeria, EquipoService equipoService) {
        this.promocionesRepository = promocionesRepository;
        this.tiendaRepository = tiendaRepository;
        this.tareaRepository = tareaRepository;
        this.asignarTiendaRepository = asignarTiendaRepository;
        this.mensajeria = mensajeria;
        this.equipoService = equipoService;
    }

    public record Result(int promociones, int tareas) {}

    @Transactional
    public Result importe(MultipartFile archi, String correoSupervisor) throws Exception {
        Set<String> equipo = equipoService.correosDelEquipo(correoSupervisor);
        int promos = 0;
        int tareas = 0;
        LocalDate hoy = LocalDate.now();
        try (Workbook libro = WorkbookFactory.create(archi.getInputStream())) {
            Sheet hoja = libro.getSheetAt(0);
            DataFormatter fmt = new DataFormatter();

            for (int i = 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                if (fila == null) continue;
                int numFila = i + 1;

                String tipo = fmt.formatCellValue(fila.getCell(0)).trim().toLowerCase();
                if (tipo.isEmpty()) continue;
                String tienda = fmt.formatCellValue(fila.getCell(1)).trim();
                String sku = fmt.formatCellValue(fila.getCell(2)).trim();
                String descrip = fmt.formatCellValue(fila.getCell(3)).trim();
                Integer precioNorm = leerP(fila.getCell(4), fmt);
                Integer precioProm = leerP(fila.getCell(5), fmt);
                LocalDate desde = leerF(fila.getCell(6), fmt, numFila);
                LocalDate hasta = leerFechaOp(fila.getCell(7), fmt, numFila);

                if (!tipo.equals("promo") && !tipo.equals("precio") && !tipo.equals("evento")) {
                    throw new RuntimeException("En la fila " + numFila + " el tipo '" + tipo + "' no es válido (usa PROMO, PRECIO o EVENTO)");
                }
                if (tienda.isEmpty() || descrip.isEmpty()) {
                    throw new RuntimeException("En la fila " + numFila + " falta la cadena o la descripción");
                }
                //para que no se duplique nada
                if (promocionesRepository.existsByTipoAndTiendaAndDescripAndDesde(tipo, tienda, descrip, desde))
                    continue;

                Promocion promo = new Promocion();
                promo.setTipo(tipo);
                promo.setTienda(tienda);
                promo.setSku(sku.isEmpty() ? null : sku);
                promo.setDescrip(descrip);
                promo.setPrecioNorm(precioNorm);
                promo.setPrecioProm(precioProm);
                promo.setDesde(desde);
                promo.setHasta(hasta);
                promocionesRepository.save(promo);
                promos++;

                boolean vencida = hasta != null && hasta.isBefore(hoy);
                if (!tipo.equals("evento") && !vencida) {
                    tareas += crearTareas(promo, equipo);
                }
            }
        }
        return new Result(promos, tareas);
    }

    private int crearTareas(Promocion promo, Set<String> equipo) {
        String nombre = (promo.getTipo().equals("precio") ? "Cambiar precio: " : "Aplicar promo: ") + promo.getDescrip();
        int creadas = 0;
        for (Tienda sucursal : tiendaRepository.findByNombreIgnoreCase(promo.getTienda())) {
            for (AsignarTienda asignacion : asignarTiendaRepository.findByTienda_IdTienda(sucursal.getIdTienda())) {
                if (equipo != null && !equipo.contains(asignacion.getCorreoPromotor())) continue;
                Tarea tarea = new Tarea();
                tarea.setTipo(promo.getTipo());
                tarea.setNombreTarea(nombre);
                tarea.setCorreoPromotor(asignacion.getCorreoPromotor());
                tarea.setTienda(sucursal);
                tareaRepository.save(tarea);

                mensajeria.convertAndSendToUser(asignacion.getCorreoPromotor(), "/queue/alertas", new AlertaDTO(
                        sucursal.getIdTienda(),
                        nombre + " · " + sucursal.getNombre(),
                        promo.getTipo(),
                        nombre,
                        LocalDateTime.now()
                ));
                creadas++;
            }
        }
        return creadas;
    }

    private Integer leerP(Cell celda, DataFormatter fmt) {
        String texto = fmt.formatCellValue(celda).replaceAll("[^0-9]", "");
        return texto.isEmpty() ? null : Integer.parseInt(texto);
    }

    private LocalDate leerF(Cell celda, DataFormatter fmt, int numFila) {
        if (celda == null) {
            throw new RuntimeException("En la fila " + numFila + " falta una fecha");
        }
        if (celda.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(celda)) {
            return celda.getLocalDateTimeCellValue().toLocalDate();
        }
        String texto = fmt.formatCellValue(celda).trim().replace("/", "-");
        try {
            return LocalDate.parse(texto, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        } catch (DateTimeParseException e) {
            throw new RuntimeException("En la fila " + numFila + " la fecha '" + texto + "' no es válida (usa dd-mm-aaaa)");
        }
    }

    private LocalDate leerFechaOp(Cell celda, DataFormatter fmt, int numFila) {
        if (celda == null || fmt.formatCellValue(celda).isBlank()) return null;
        return leerF(celda, fmt, numFila);
    }
}
