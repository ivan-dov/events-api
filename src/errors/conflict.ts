export type ConflictErrorType = 'unique' | 'foreignKey';

export class ConflictError extends Error {
    constructor(
        public readonly type: ConflictErrorType,
        ...rest: ConstructorParameters<typeof Error>
    ) {
        super(...rest);
    }
}
