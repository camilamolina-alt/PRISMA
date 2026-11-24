package com.Prisma.PRISMA.service;

import com.Prisma.PRISMA.model.Producto;
import com.Prisma.PRISMA.model.EstadoEnvio;
import com.Prisma.PRISMA.model.Envio;
import com.Prisma.PRISMA.model.EnvioDetalle;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.EnvioDetalleRepository;
import com.Prisma.PRISMA.repository.EnvioRepository;
import com.Prisma.PRISMA.repository.ProductRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class EnvioLectura {
    private final EnvioRepository envioRepository;
    private final EnvioDetalleRepository envioDetalleRepository;
    private final TiendaRepository tiendaRepository;
    private final ProductRepository productRepository;

    public EnvioLectura(EnvioRepository envioRepository, EnvioDetalleRepository detalleRepository,
                        TiendaRepository tiendaRepository, ProductRepository productRepository) {
        this.envioDetalleRepository = detalleRepository;
        this.envioRepository = envioRepository;
        this.tiendaRepository = tiendaRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void importe(MultipartFile archi) throws Exception {
        try (Workbook libro = WorkbookFactory.create(archi.getInputStream())) {
            Sheet hoja = libro.getSheetAt(0);
            DataFormatter fmt = new DataFormatter();

            for (int i = 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                if (fila == null) continue;
                int numFila = i + 1;

                String cadena = fmt.formatCellValue(fila.getCell(0)).trim();
                String ubicacion = fmt.formatCellValue(fila.getCell(1)).trim();
                Cell pluCel = fila.getCell(3);
                String plu = (pluCel.getCellType() == CellType.NUMERIC) ? new
                        java.math.BigDecimal(pluCel.getNumericCellValue()).toPlainString() : fmt.formatCellValue(pluCel).trim();
                Integer cantidad = (int) fila.getCell(5).getNumericCellValue();
                LocalDate fechaEnvio = leerFecha(fila.getCell(6), fmt, numFila);
                LocalDate aproxLlegada = leerFecha(fila.getCell(7), fmt, numFila);
                Tienda tienda = tiendaRepository
                        .findByNombreIgnoreCaseAndUbicacionIgnoreCase(cadena, ubicacion)
                        .orElseThrow(() -> new RuntimeException(
                                "En la fila " + numFila + " no existe la tienda " + cadena + " en " + ubicacion));

                Producto producto = productRepository.findBySku(plu)
                        .orElseThrow(() -> new RuntimeException(
                                "En la fila " + numFila + " no existe el producto con sku " + plu));

                Envio envio = envioRepository
                        .findByTienda_IdTiendaAndFechaEnvio(tienda.getIdTienda(), fechaEnvio)
                        .orElseGet(() -> {
                            Envio nuevo = new Envio();
                            nuevo.setTienda(tienda);
                            nuevo.setFechaEnvio(fechaEnvio);
                            nuevo.setAproxLlegada(aproxLlegada);
                            nuevo.setEstado(EstadoEnvio.EN_CAMINO);
                            return envioRepository.save(nuevo);
                        });

                EnvioDetalle detalle = envioDetalleRepository
                        .findByEnvio_IdEnvioAndProducto_Sku(envio.getIdEnvio(), plu)
                        .orElseGet(EnvioDetalle::new);
                detalle.setEnvio(envio);
                detalle.setProducto(producto);
                detalle.setCantidad(cantidad);
                envioDetalleRepository.save(detalle);
            } // cierra for
        } // cierra try
    } // cierra importe

    private LocalDate leerFecha(Cell celda, DataFormatter fmt, int numFila) {
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
    } // cierra leerFecha
} // cierra la clase
