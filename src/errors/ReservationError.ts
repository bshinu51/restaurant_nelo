export class ReservationError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'ReservationError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReservationError)
    }
  }
}
