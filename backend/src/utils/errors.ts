export class AppError extends Error {
    constructor(public message: string, public status = 400) {
        super(message);
    }
}