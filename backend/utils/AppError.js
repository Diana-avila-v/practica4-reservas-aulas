// Error con código HTTP que el manejador centralizado sabe interpretar.
class AppError extends Error {
  constructor(mensaje, statusCode = 400, detalles) {
    super(mensaje);
    this.statusCode = statusCode;
    if (detalles) this.detalles = detalles;
  }
}

module.exports = AppError;
