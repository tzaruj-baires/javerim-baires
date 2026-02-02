export function capitalizar(str) {
  if (!str) return str;

  console.log(str);

  str = str.trim().toLowerCase();
  console.log(str);

  str = str.charAt(0).toUpperCase() + str.slice(1);
  console.log(str);

  return str;
}


export function capitalizarEsp(str) {
  if (!str) return str;

  const minusculas = ["en", "de", "y", "la", "el", "los", "las", "del", "o"];

  return str
    .trim()
    .toLowerCase()
    .split(" ")
    .map((palabra, index) => {
      if (index !== 0 && minusculas.includes(palabra)) {
        return palabra;
      }
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
}
