# Plan Maestro: ConquisApp v2 (OpenAI Edition)

Este documento define la hoja de ruta para la evolución de ConquisApp hacia una plataforma moderna con asistencia inteligente para instructores, utilizando el stack de OpenAI.

## Visión
Transformar la aplicación en una herramienta esencial que no solo entrega PDFs, sino que asiste activamente al instructor generando ideas pedagógicas mediante IA, todo bajo una interfaz moderna "Apple-like".

## Arquitectura Técnica

| Componente | Selección | Justificación |
|---|---|---|
| **Backend** | **NestJS** + TypeORM | Modularidad, inyección de dependencias y ecosistema robusto. |
| **Base de Datos** | **PostgreSQL 16** | Relacional robusta. |
| **Vector DB** | **pgvector** | Extensión nativa de Postgres para búsqueda semántica. |
| **Frontend** | **React 19** + TypeScript | Migración a TS. Rediseño visual completo. |
| **IA (LLM)** | **OpenAI GPT-4o-mini** | Mejor relación inteligencia/precio/velocidad del mercado. |
| **IA (Embeddings)** | **text-embedding-3-small** | Embeddings oficiales de OpenAI (baratos y potentes). |
| **Deploy** | **VPS Propio** (Docker) | Infraestructura existente. |

---

## Estrategia de Fases

### FASE 0: Infraestructura & Setup Backend
**Objetivo:** Base de datos lista y proyecto NestJS inicializado.
- [ ] Configurar `docker-compose.conquis.yml` con PostgreSQL + pgvector.
- [ ] Inicializar proyecto `backend-nestjs`.
- [ ] Configurar TypeORM y conexión a DB.
- [ ] Definir Entidades: `Category`, `Specialty`, `Requirement`, `Area`, `IntegrationLink`.
- [ ] Definir Entidades Vectoriales: `SpecialtyVector`, `RequirementVector`.

### FASE 1: Migración de API (Paridad)
**Objetivo:** Replicar funcionalidad de Express en NestJS.
- [ ] Implementar `CepModule` (Endpoints `/api/cep`...).
- [ ] Implementar `AreasModule` (Endpoints `/api/areas`...).
- [ ] Implementar `IntegrationModule`.
- [ ] Asegurar paridad de JSON responses.

### FASE 2: Migración de Datos (Seed)
**Objetivo:** Poblar PostgreSQL con los datos de los JSONs actuales.
- [ ] Script de seed para importar `manifest.json`, `especialidades.json` y `links.json`.
- [ ] Verificación de datos en DB.

### FASE 3: Frontend - Limpieza & TypeScript
**Objetivo:** Preparar el frontend para el futuro.
- [ ] Migrar a TypeScript (`.tsx`).
- [ ] Tipar respuestas de API.
- [ ] Limpieza de código legacy.

### FASE 4: Frontend - Rediseño Visual
**Objetivo:** Nueva interfaz minimalista y premium.
- [ ] Nuevo sistema de diseño (Tailwind 4 + Radix).
- [ ] Rediseño de vistas de lista y detalle.
- [ ] Visor PDF integrado mejorado.

### FASE 5: Pipeline de Ingesta (RAG - Parte 1)
**Objetivo:** Convertir PDFs en conocimiento consultable.
- [ ] Servicio de lectura de PDFs (`pdf-parse`).
- [ ] Estrategia de Chunking (dividir por requisitos).
- [ ] **Generación de Embeddings:** Script que envíe textos a OpenAI (`text-embedding-3-small`) y guarde vectores en Postgres.

### FASE 6: Servicios de IA (RAG - Parte 2)
**Objetivo:** Crear el cerebro del asistente.
- [ ] Servicio `OpenAIService` en NestJS.
- [ ] Lógica de Búsqueda Vectorial (Consulta -> Vector -> pgvector search).
- [ ] Construcción de Prompts ("Actúa como un guía de Conquistadores...").
- [ ] Endpoints: `/api/ai/ideas`, `/api/ai/chat`.

### FASE 7: UI Asistente Inteligente
**Objetivo:** Interfaz de usuario para la IA.
- [ ] Panel lateral "Asistente" en la vista de especialidad.
- [ ] Botones de acción rápida: "Dame ideas para este requisito".
- [ ] Streaming de respuestas (efecto de escritura).

### FASE 8: Producción
**Objetivo:** Lanzamiento.
- [ ] Dockerización final.
- [ ] Deploy en VPS.
- [ ] Switch de DNS.

---

## Guía de Continuidad
Para retomar el trabajo:
> "Estoy trabajando en `docs/PLAN-PHASES.md`. He completado la **Fase X**. Vamos a la **Fase Y**."
