package com.Prisma.PRISMA.controller;

import com.Prisma.PRISMA.dto.AlertaDTO;
import com.Prisma.PRISMA.model.Stock;
import com.Prisma.PRISMA.repository.StockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "*")
public class StockController {

    public record CantidadRequest(Integer cantidad) {}

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate mensajeria;

    public StockController(StockRepository stockRepository, SimpMessagingTemplate mensajeria) {
        this.stockRepository = stockRepository;
        this.mensajeria = mensajeria;
    }

    // GET /api/stock
    @GetMapping
    public ResponseEntity<List<Stock>> listarTodos() {
        return ResponseEntity.ok(stockRepository.findAll());
    }

    // GET /api/stock/tienda/1
    @GetMapping("/tienda/{idTienda}")
    public ResponseEntity<List<Stock>> porTienda(@PathVariable Long idTienda) {
        return ResponseEntity.ok(stockRepository.findByTienda_IdTienda(idTienda));
    }


    @GetMapping("/buscar")
    public ResponseEntity<Stock> buscarPorSkuYTienda(
            @RequestParam String sku,
            @RequestParam Long idTienda) {
        return stockRepository.findByProducto_SkuAndTienda_IdTienda(sku, idTienda)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/stock/criticos
    @GetMapping("/criticos")
    public ResponseEntity<List<Stock>> listarCriticosGlobal() {
        return ResponseEntity.ok(stockRepository.findTodosCriticos());
    }

    // GET /api/stock/tienda/1/criticos (Para el banner rojo de quiebres en Home)
    @GetMapping("/tienda/{idTienda}/criticos")
    public ResponseEntity<List<Stock>> listarCriticosPorTienda(@PathVariable Long idTienda) {
        return ResponseEntity.ok(stockRepository.findCriticosPorTienda(idTienda));
    }


    @PostMapping
    public ResponseEntity<Stock> crear(@RequestBody Stock stock) {
        Stock nuevoStock = stockRepository.save(stock);
        verificarYNotificar(nuevoStock);
        return ResponseEntity.ok(nuevoStock);
    }


    @PutMapping("/{id}/sala")
    public ResponseEntity<?> actualizarSala(
            @PathVariable Long id,
            @RequestBody CantidadRequest body) {

        if (body.cantidad() == null || body.cantidad() < 0) {
            return ResponseEntity.badRequest().body("La cantidad debe ser un entero mayor o igual a 0");
        }

        return stockRepository.findById(id).map(stock -> {
            stock.setCant_sala(body.cantidad());
            stock.setAct_sala(LocalDateTime.now());
            Stock guardado = stockRepository.save(stock);

            verificarYNotificar(guardado);

            return ResponseEntity.ok(guardado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/stock/1/planilla
    @PutMapping("/{id}/planilla")
    public ResponseEntity<?> actualizarPlanilla(
            @PathVariable Long id,
            @RequestBody CantidadRequest body) {

        if (body.cantidad() == null || body.cantidad() < 0) {
            return ResponseEntity.badRequest().body("La cantidad debe ser un entero mayor o igual a 0");
        }

        return stockRepository.findById(id).map(stock -> {
            stock.setCant_enviada(body.cantidad());
            stock.setAct_planilla(LocalDateTime.now());
            Stock guardado = stockRepository.save(stock);

            return ResponseEntity.ok(guardado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- APIS ---

    private void verificarYNotificar(Stock stock) {
        if (esCritico(stock)) {
            mensajeria.convertAndSend("/topic/alertas", new AlertaDTO(
                    stock.getTienda().getIdTienda(),
                    "Stock crítico: " + stock.getProducto().getNombre() + " (" + stock.getCant_sala() + " unidades)",
                    "critico",
                    stock.getProducto().getNombre(),
                    LocalDateTime.now()
            ));
        }
    }

    private boolean esCritico(Stock s) {
        return s.getCant_sala() != null
                && s.getStock_critico() != null
                && s.getCant_sala() <= s.getStock_critico();
    }
}