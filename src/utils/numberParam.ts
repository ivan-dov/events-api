import { toNumber } from './toNumber';

export type NumberOptions = {
    allowNegative?: boolean;
    integer?: boolean;
    required?: boolean;
};

export type NumberParamOutput =
    | {
          type: 'success';
          value: number | undefined;
      }
    | {
          type: 'error';
          message: string;
      };

export const numberParam = (
    value: unknown,
    {
        integer = false,
        allowNegative = true,
        required = false,
    }: NumberOptions = {},
): NumberParamOutput => {
    value = typeof value === 'string' ? value.trim() : value;
    const number = toNumber(value);

    if (number === undefined && required) {
        return {
            type: 'error',
            message: 'is required',
        };
    }

    if (number === undefined) {
        return {
            type: 'success',
            value: undefined,
        };
    }

    if (!allowNegative && number < 0) {
        return {
            type: 'error',
            message: 'should be a positive number',
        };
    }

    if (integer && !Number.isInteger(number)) {
        return {
            type: 'error',
            message: 'should be an integer',
        };
    }

    return {
        type: 'success',
        value: number,
    };
};
