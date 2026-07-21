# Guía de tallas — La Cábala

Referencia completa de las tallas publicadas en la tienda (modal de producto en `sections/baul-product.liquid`).

**Última actualización:** julio 2026  
**Medidas:** centímetros (aproximadas)

---

## Cómo se elige la guía en cada producto

El modal muestra **una sola tabla** según el título del producto:

| Guía | Se activa cuando el título contiene |
|------|-------------------------------------|
| **Niños** | `Niño`, `niño`, `Nino`, `nino` |
| **Mujer** | `Mujer`, `mujer` |
| **Jugador** | `Player`, `player`, `PLAYER` |
| **Cortavientos / Chaqueta** | `Cortavientos`, `cortavientos`, `Chaqueta`, `chaqueta` |
| **Fan (adulto)** | Cualquier otro producto (por defecto) |

Todas las guías incluyen además la sección **“Cómo tomar tus medidas”** y los **Tips** (ver abajo).

---

## Cómo tomar tus medidas

### A — Pecho
Mide alrededor de la parte más ancha del pecho, justo debajo de las axilas. Mantén la cinta métrica horizontal.

### B — Largo
Mide desde el punto más alto del hombro (junto al cuello) hasta la parte inferior de la camiseta.

### C — Altura
Recomendamos elegir tu talla según tu altura.

---

## Tips

1. **Cinta métrica:** Usa una cinta métrica y mide sobre tu cuerpo, no sobre otra prenda.
2. **Elegir por pecho:** Para un ajuste cómodo, elige tu talla según tu medida de pecho.
3. **Entre dos tallas:** Si estás entre dos tallas, elige la mayor para más comodidad.

---

## 1. Adulto Fan (versión hincha / casual)

**Nota:** Corte holgado, ideal para uso casual.

| Talla | Largo (cm) | Ancho (cm) | Altura (cm) | Peso (kg) |
|-------|------------|------------|-------------|-----------|
| S     | 68-70      | 49-51      | 160-165     | 50-62     |
| M     | 70-72      | 51-53      | 165-170     | 62-70     |
| L     | 72-74      | 53-55      | 170-175     | 71-75     |
| XL    | 74-77      | 55-57      | 175-180     | 76-80     |
| 2XL   | 77-79      | 57-59      | 180-185     | 81-89     |
| 3XL   | 79-82      | 59-61      | 185-190     | 90-96     |
| 4XL   | 83-85      | 61-63      | 190-195     | 97-106    |

---

## 2. Jugador (versión player)

**Nota:** Se recomienda 1 talla más para ajustada, 2 tallas más para suelta. Variación ±1-3 cm.

| Talla | Largo (cm) | Ancho (cm) | Peso (kg) |
|-------|------------|------------|-----------|
| S     | 69-71      | 45-47      | 48-62     |
| M     | 62-74      | 47-49      | 62-70     |
| L     | 74-75      | 49-51      | 68-75     |
| XL    | 76-78      | 51-53      | 72-80     |
| 2XL   | 78-80      | 53-55      | 78-90     |

---

## 3. Mujer

| Talla   | Largo (cm) | Ancho (cm) | Altura (cm) |
|---------|------------|------------|-------------|
| S = P   | 61-63      | 40-41      | 150-160     |
| M = M   | 63-66      | 41-44      | 160-165     |
| L = G   | 66-69      | 44-47      | 165-170     |
| XL = GG | 69-71      | 47-50      | 170-175     |

---

## 4. Niños

**Nota de medidas:**  
- **Largo** = desde el hombro hacia abajo  
- **Ancho** = de axila a axila  
- **Cintura** = parte inferior de la prenda  

| Talla | Edad   | Altura (cm) | Largo (cm) | Ancho (cm) | Cintura (cm) |
|-------|--------|-------------|------------|------------|--------------|
| 4     | 3-4    | 95-105      | 44         | 35         | 20-37        |
| 6     | 4-5    | 105-115     | 47         | 37         | 21-39        |
| 8     | 5-6    | 115-125     | 50         | 39         | 22-41        |
| 10    | 6-7    | 125-135     | 53         | 41         | 23-42        |
| 12    | 8-9    | 135-145     | 56         | 43         | 24-44        |
| 14    | 10-11  | 145-155     | 59         | 45         | 25-47        |
| 16    | 12-13  | 155-165     | 62         | 47         | 26-50        |

---

## 5. Cortavientos y chaquetas

**Nota:** Aplica también para chaquetas. Variación ±2 cm.

| Talla | Largo | Pecho | Hombros | Manga | Altura (cm) | Peso (kg) |
|-------|-------|-------|---------|-------|-------------|-----------|
| S     | 65    | 56    | 46      | 61    | 160-165     | 50-60     |
| M     | 67    | 58    | 47.5    | 62.5  | 165-170     | 60-70     |
| L     | 69    | 60    | 49      | 64    | 170-175     | 70-80     |
| XL    | 71    | 62    | 50.5    | 65.5  | 175-180     | 80-85     |
| XXL   | 73    | 64    | 52      | 67    | 180-185     | 85-95     |

---

## Aviso general

ⓘ **Medidas aproximadas en centímetros.** Las tallas pueden variar ligeramente según el modelo.

---

## Archivos en el tema (referencia técnica)

| Archivo | Uso |
|---------|-----|
| `sections/baul-product.liquid` | Tablas de tallas + lógica de detección por producto |
| `snippets/baul-tallas-guide-extra.liquid` | Sección “Cómo tomar tus medidas” + Tips |
| `snippets/guia-de-tallas.liquid` | Snippet legacy (no renderizado en el PDP actual) |
