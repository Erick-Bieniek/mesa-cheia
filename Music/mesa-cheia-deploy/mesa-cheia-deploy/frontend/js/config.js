// Como o front e servido pelo MESMO servidor Express da API, usamos caminho
// relativo ("" => /search, /cart, etc.). Se um dia separar as portas, basta
// trocar por "http://localhost:3000".
export const API_BASE = '';
