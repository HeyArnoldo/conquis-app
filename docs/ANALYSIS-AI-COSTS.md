# Análisis de Estrategia IA: Costos y Modelos para ConquisApp

Este documento detalla los requisitos, costes estimados y consideraciones técnicas para implementar la funcionalidad de RAG (Búsqueda y Generación Aumentada) en ConquisApp, comparando la propuesta original (Gemini/Hugging Face) con el stack de OpenAI.

## 1. Requisitos Técnicos (Stack OpenAI)

Para implementar RAG con OpenAI en la arquitectura NestJS + Postgres actual, son necesarios los siguientes 4 pilares:

1.  **Vector Database (Ya planificado):** Base de datos PostgreSQL con la extensión `pgvector` activada. Imprescindible para almacenar los vectores (representaciones numéricas del texto).
2.  **API Key de OpenAI:** Cuenta con créditos activos (modelo de pago por uso, no suscripción mensual).
3.  **Pipeline de Ingesta:** Un script automatizado que realice lo siguiente:
    *   Lectura de PDFs.
    *   Limpieza y división en fragmentos (*chunks*).
    *   Envío a OpenAI para generación de vectores.
    *   Almacenamiento en Postgres.
4.  **Lógica de Búsqueda:** El backend debe ser capaz de:
    *   Vectorizar la consulta del usuario (usando el **mismo** modelo de embedding).
    *   Realizar búsqueda por similitud de coseno en Postgres.
    *   Construir el prompt con contexto recuperado y enviarlo al LLM.

---

## 2. Estimación de Costos (OpenAI)

OpenAI cobra por **Token** (aprox. 4 caracteres). Para el volumen del proyecto (477 PDFs), los costes con los modelos actuales son muy bajos.

### A. Coste de Embeddings (Indexación)
**Modelo:** `text-embedding-3-small`
*   **Precio:** $0.02 USD por 1 millón de tokens.
*   **Estimación ConquisApp:** Si los 477 PDFs suman ~5 millones de tokens (aprox. 2,500 páginas densas), indexar todo el contenido costaría **$0.10 USD (10 centavos)**.
*   *Nota:* Este es un costo único (solo se paga de nuevo al actualizar documentos).

### B. Coste del Modelo (Consultas)
**Modelo:** `gpt-4o-mini` (Inteligente, rápido y económico)
*   **Precio:** $0.15 (entrada) / $0.60 (salida) por 1 millón de tokens.
*   **Estimación por Uso:** Una interacción típica (pregunta + 5 chunks de contexto) consume ~2,000 tokens.
*   **Proyección:** 1,000 preguntas costarían aproximadamente **$0.0004 USD**. Con $1 USD se cubren miles de consultas.

---

## 3. Tabla Comparativa de Estrategias

| Característica | **Opción A: OpenAI (Recomendada)** | **Opción B: Plan Actual (Gemini + HF)** | **Opción C: Local (Ollama)** |
| :--- | :--- | :--- | :--- |
| **Modelos** | `gpt-4o-mini` + `text-embedding-3-small` | `gemini-1.5-flash` + `all-MiniLM-L6-v2` | `llama3` + `nomic-embed-text` |
| **Costo Operativo** | **Muy bajo** ($1-5/mes según uso). | **Gratis** (hasta límites de rate limit). | **$0** (pero requiere hardware potente). |
| **Calidad Embeddings** | **Excelente**. Alta comprensión semántica en español. | **Buena**. Modelos ligeros, menos matices. | **Variable**. Depende de la capacidad del VPS. |
| **Facilidad de Uso** | **Alta**. SDK oficial robusto, documentación clara. | **Media**. Gestión de dos proveedores distintos. | **Baja**. Mantenimiento de infraestructura propia. |
| **Velocidad** | Muy rápida y estable. | Rápida, sujeta a prioridades del tier gratuito. | Lenta si el VPS no tiene GPU dedicada. |
| **Privacidad** | Datos procesados por OpenAI (política Enterprise no entrena). | Datos procesados por Google/HF. | **Total**. Los datos no salen del VPS. |

---

## 4. Compatibilidad de Embeddings

Es crucial entender que **los embeddings NO son universales**.

1.  **Acoplamiento Fuerte:** Debes usar **exactamente el mismo modelo** para indexar (guardar los PDFs) que para buscar (convertir la pregunta del usuario).
    *   *Ejemplo:* Si indexas con `text-embedding-3-small`, **NO** puedes buscar con `all-MiniLM-L6-v2`. Los vectores resultantes son matemáticamente incompatibles.
    
2.  **Independencia del LLM:** Aunque el embedding debe ser consistente, el **texto recuperado** puede ser enviado a cualquier modelo.
    *   *Flujo posible:* Usar embeddings de OpenAI para encontrar la información -> Enviar el texto encontrado a Gemini/Claude/Llama para redactar la respuesta final.

## 5. Recomendación

*   **Para Calidad/Precio:** Usar el stack completo de **OpenAI (`gpt-4o-mini`)**. El costo es insignificante para el valor de estabilidad y calidad que aporta.
*   **Para Coste Cero Estricto:** Mantener el plan original de **Gemini 1.5 Flash + Hugging Face**, aceptando cierta complejidad extra en la implementación y posibles límites de tasa.
