export const getInitials = (name: string) => {
    if (!name) return "NN";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
        // Ambil huruf pertama dari kata pertama dan kedua (misal: Muhammad Fikri -> MF)
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    // Jika cuma satu kata, ambil 2 huruf pertama
    return name.substring(0, 2).toUpperCase();
};