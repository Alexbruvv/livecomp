const encodedSecret = new TextEncoder().encode(Bun.env.ACCESS_TOKEN_SECRET);

export const auth = {
    encodedSecret,
};
