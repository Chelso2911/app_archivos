// Obtén la URL actual
const urlActual = window.location.href;

// Verifica si el parámetro 'nombre' ya está presente en la URL
const parametros = new URLSearchParams(window.location.search);
// Obtener nombre del path si no está en los parámetros
let carpetaNombre =
  parametros.get("nombre") || window.location.pathname.substring(1);

if (!carpetaNombre || carpetaNombre === "index.php") {
  // Si 'nombre' no está presente o es 'index.php', genera una cadena aleatoria
  carpetaNombre = generarCadenaAleatoria();
  // Agrega la nueva estructura de URL sin parámetros
  const urlConParametro = `${window.location.origin}/${carpetaNombre}`;
  // Redirige a la nueva URL con el 'nombre' en el path
  window.location.href = urlConParametro;
} else {
  // Llama a la función para crear la carpeta con el nombre obtenido
  crearCarpeta(carpetaNombre);
}

// Función para generar una cadena aleatoria
function generarCadenaAleatoria() {
  const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
  let cadenaAleatoria = "";
  for (let i = 0; i < 3; i++) {
    const caracterAleatorio = caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
    cadenaAleatoria += caracterAleatorio;
  }
  return cadenaAleatoria;
}

// Función para crear la carpeta
function crearCarpeta(carpetaNombre) {
  $.ajax({
    url: "crearCarpeta.php",
    type: "POST",
    data: { nombreCarpeta: carpetaNombre },
    success: function (response) {
      console.log("Carpeta creada con éxito:", response);
    },
    error: function (xhr, status, error) {
      console.error("Error al crear la carpeta:", error);
    },
  });
}

function handleFiles(files) {
  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-container");
  let totalFiles = files.length;
  let currentIndex = 0;

  progressContainer.style.display = "block";

  function uploadNextFile() {
    if (currentIndex >= totalFiles) {
      progressContainer.style.display = "none";
      window.location.href =
        window.location.pathname +
        (window.location.search ? window.location.search : "");
      return;
    }

    const file = files[currentIndex];
    const formData = new FormData(); 
    formData.append("archivo", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "", true);

    xhr.upload.addEventListener("progress", function (event) {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percentComplete + "%";
        progressBar.textContent = percentComplete + "%";
      }
    });

    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        progressBar.style.width = "100%";
        progressBar.textContent = "100%";
        setTimeout(() => {
          progressBar.style.width = "0%";
          progressBar.textContent = "0%";
          currentIndex++;
          uploadNextFile();
        }, 1000);
      } else {
        console.error("Error al subir el archivo", file.name);
        currentIndex++;
        uploadNextFile();
      }
    });

    xhr.send(formData);
  }

  uploadNextFile();
}

// Eventos del arrastre de archivos
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over");
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Evento de cambio del input para manejar múltiples archivos
document.getElementById("archivo").addEventListener("change", function (event) {
  const files = event.target.files;
  handleFiles(files);
});