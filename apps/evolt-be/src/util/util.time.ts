export const expiresIn30Minutes = () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    return expiresAt.toISOString();

}