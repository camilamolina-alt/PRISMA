package com.Prisma.PRISMA.service;

import com.Prisma.PRISMA.model.Producto;
import com.Prisma.PRISMA.model.Stock;
import com.Prisma.PRISMA.model.Tienda;
import com.Prisma.PRISMA.repository.StockRepository;
import com.Prisma.PRISMA.repository.TiendaRepository;
import org.apache.commons.math3.stat.descriptive.summary.Product;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import com.Prisma.PRISMA.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class Excellectura {
    private final TiendaRepository tiendaRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public Excellectura(ProductRepository productRepository, StockRepository stockRepository, TiendaRepository tiendaRepository) {
        this.productRepository = productRepository;
        this.tiendaRepository = tiendaRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public void importe(MultipartFile archi) throws Exception {
        try (Workbook libro = WorkbookFactory.create(archi.getInputStream())) {
            Sheet hoja = libro.getSheetAt(0);
            DataFormatter fmt = new DataFormatter();

            for (int i = 1; i <= hoja.getLastRowNum(); i++) {
                Row fila = hoja.getRow(i);
                if (fila == null) continue;

                Cell skucel = fila.getCell(0);
                String sku = (skucel.getCellType() == CellType.NUMERIC) ? new
                        java.math.BigDecimal(skucel.getNumericCellValue()).toPlainString() : fmt.formatCellValue(skucel).trim();

                String nombre = fmt.formatCellValue(fila.getCell(1)).trim();
                String ubicacion = fmt.formatCellValue(fila.getCell(2)).trim();
                Integer cantEnv = (int) fila.getCell(3).getNumericCellValue();
                String tienda = fmt.formatCellValue(fila.getCell(4)).trim();
                Long precio = (long) fila.getCell(5).getNumericCellValue();

                int numFila = i+1;
                Producto producto = productRepository
                        .findBySku(sku)
                        .orElse(new Producto());
                Tienda tiendaE = tiendaRepository
                        .findByNombreIgnoreCaseAndUbicacionIgnoreCase(tienda , ubicacion)
                        .orElseThrow(() -> new RuntimeException(
                                "En la fila " + numFila + " no existe la tienda " + tienda + " en " + ubicacion));
                //Para enviar el dato del sku con el producto
                producto.setNombre(nombre);
                producto.setPrecio(precio);
                producto.setSku(sku);
                producto = productRepository.save(producto);

                Stock stock = stockRepository
                        .findByProducto_SkuAndTienda_IdTienda(sku, tiendaE.getIdTienda())
                        .orElse(new Stock());

                stock.setProducto(producto);
                stock.setCant_enviada(cantEnv);
                stock.setTienda(tiendaE);
                stock.setAct_planilla(LocalDateTime.now());
                stockRepository.save(stock);







            }
        }
    }
}




