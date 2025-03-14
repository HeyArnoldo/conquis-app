export function slugify(value) {
    return value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')       // Reemplaza espacios por guiones
      .replace(/[^\w\-]+/g, '')   // Elimina caracteres no válidos
      .replace(/\-\-+/g, '-');    // Reemplaza múltiples guiones por uno solo
  }
  