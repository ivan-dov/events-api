export const toNumber = (value: unknown): number | undefined => {
    if (value === 0) return value;
    if (!value) return undefined;
    let result;

    if (typeof value === 'string') {
        result = +value.toString();
    } else {
        result = +value;
    }

    return isNaN(result) ? undefined : result;
};
