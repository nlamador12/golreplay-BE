const express = require("express");
const mysql = require("mysql");
const app = express();
//const port = process.env.PORT || 3000;
const cors = require("cors");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require("axios"); // Librería para realizar solicitudes HTTP
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configuración personalizada de CORS
// const corsOptions = {
//   origin: ['https://golreplay.com', 'http://golreplay.com'],
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
app.use(cors());
// Configurar pool de conexiones a la base de datos
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "namador",
  password: "Lg.94461822.1912",
  database: "GolReplay",
});


// const pool = mysql.createPool({
//   connectionLimit: 10,
//   host: "us-bos-web1458.main-hosting.eu",
//   user: "u980291383_namador",
//   password: "Olimpia.1912",
//   database: "u980291383_VideoGaleria",
// });

// Middleware para obtener una conexión del pool
const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

// Middleware para liberar la conexión de vuelta al pool
const releaseConnection = (connection) => {
  connection.release();
};

// Endpoint para obtener todos los clubes
app.get("/api/clubes", async (req, res) => {
  try {
    const connection = await getConnection();
    connection.query("SELECT * FROM clubes", (error, results) => {
      releaseConnection(connection); // Liberar la conexión después de la consulta
      if (error) {
        console.error("Error querying database:", error);
        res.status(500).send("Error querying database");
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).send("Error connecting to database");
  }
});

// Endpoint para obtener las canchas de un club específico
app.get("/api/canchas/:id", async (req, res) => {
  const clubId = req.params.id;
  try {
    const connection = await getConnection();
    connection.query(
      "SELECT * FROM canchas WHERE club = ?",
      [clubId],
      (error, results) => {
        releaseConnection(connection); // Liberar la conexión después de la consulta
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          res.json(results);
        }
      }
    );
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).send("Error connecting to database");
  }
});

// Endpoint para obtener las cámaras de una cancha específica de un club
app.get("/api/camaras/:clubId/:canchaId", async (req, res) => {
  const { clubId, canchaId } = req.params;
  try {
    const connection = await getConnection();
    connection.query(
      "SELECT * FROM camaras WHERE club = ? AND cancha = ?",
      [clubId, canchaId],
      (error, results) => {
        releaseConnection(connection); // Liberar la conexión después de la consulta
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          res.json(results);
        }
      }
    );
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).send("Error connecting to database");
  }
});

// Endpoint para obtener las cámaras de una cancha específica de un club mas todos los datos de la cancha
app.get("/api/camarasdatos/:clubId/:canchaId", async (req, res) => {
  const { clubId, canchaId } = req.params;
  try {
    const club = await SelectMysqlClub(clubId);
    const cancha = await SelectMysqlCanchaId(clubId, canchaId);
    const camaras = await SelectMysqlCamaras(clubId, canchaId);
    const datos = {
      club: club[0],
      cancha: cancha[0],
      camaras: camaras
    };
    res.json(datos);
  }catch (error) {
    console.error("Error al crear los datos resultantes:", error);
    res.status(500).send("Error al crear los datos resultantes");
  }
});



const executeQuery = (connection, query, values) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
// Función para consultar enlaces compartidos por ruta
const SelectMysqlLinks = async (ruta) => {
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await getConnection();

    const query = "SELECT * FROM links_compartidos WHERE ruta = ?";
    const results = await executeQuery(connection, query, [ruta]);
    return results;
  } catch (error) {
    console.error("Error en la consulta a la base de datos:", error);
    return []; // Devolver un array vacío en caso de error
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};
// Seleccion de club
const SelectMysqlClub = async (idClub) => {
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await getConnection();
    const query = "SELECT * FROM clubes WHERE id = ?";
    const results = await executeQuery(connection, query, [idClub]);
    return results;
  } catch (error) {
    console.error("Error en la consulta a la base de datos:", error);
    return []; // Devolver un array vacío en caso de error
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};
// Seleccion de cancha por club y cancha
const SelectMysqlCanchaId = async (idClub, idCancha) => {
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await getConnection();
    const query = "SELECT * FROM canchas WHERE id = ? and club = ?";
    const results = await executeQuery(connection, query, [idCancha, idClub]);
    return results;
  } catch (error) {
    console.error("Error en la consulta a la base de datos:", error);
    return []; // Devolver un array vacío en caso de error
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

//Seleccion de todas las camaras de la cancha
const SelectMysqlCamaras = async (idClub, idCancha) => {
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await getConnection();
    const query = "SELECT * FROM camaras WHERE club = ? and cancha = ?";
    const results = await executeQuery(connection, query, [idClub, idCancha]);
    return results;
  } catch (error) {
    console.error("Error en la consulta a la base de datos:", error);
    return []; // Devolver un array vacío en caso de error
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

const SelectMysqlCancha = async (canchaId) => {
  let connection;
  try {
    // Obtener una conexión del pool
    connection = await getConnection();
    const query =
      "SELECT canchas.nombre as nombreCancha, clubes.nombre as nombreClub, clubes.logo as logo FROM canchas INNER JOIN clubes on canchas.club = clubes.id WHERE canchas.id = ?";
    const results = await executeQuery(connection, query, [canchaId]);
    return results;
  } catch (error) {
    console.error("Error en la consulta a la base de datos:", error);
    return []; // Devolver un array vacío en caso de error
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};
// Variable para almacenar el token de Dropbox
let dropboxAccessToken = "";

// Función para actualizar el token de Dropbox
const updateDropboxToken = async () => {
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token:
            "wQEZ7CpHWWoAAAAAAAAAAT2wt6mz6_ddTUTQvj4n4irHFbc94tJUaUWcbGDV9-0b",
          client_id: "siwi1224srpg8tw",
          client_secret: "68rl04er30mdzyw",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    dropboxAccessToken = response.data.access_token;
    console.log("Token de Dropbox actualizado:", dropboxAccessToken);
  } catch (error) {
    console.error("Error al actualizar el token de Dropbox:", error);
  }
};

// Programar la actualización del token cada 4 horas (4 * 60 * 60 * 1000 ms)
setInterval(updateDropboxToken, 4 * 60 * 60 * 1000);

// Ejecutar la función inmediatamente para actualizar el token al inicio
updateDropboxToken();

app.get("/api/archivos/:clubId/:canchaId/:fecha", async (req, res) => {
  const { clubId, canchaId, fecha } = req.params;
  const ruta = "/" + clubId + "/" + canchaId + "/" + fecha;
  try {
    const files = await listDatosVideos(ruta, ruta, 1, canchaId); //Opcion 1 seleccion por fecha
    res.json(files);
  } catch (error) {
    res.status(500).send({
      error: "Error al obtener archivos",
      message: error.message,
    });
  }
});

app.get(
  "/api/archivoshora/:clubId/:canchaId/:fecha/:hora",
  async (req, res) => {
    const { clubId, canchaId, fecha, hora } = req.params;
    const ruta = "/" + clubId + "/" + canchaId + "/" + fecha + "/" + hora;
    const rutaMysql = "/" + clubId + "/" + canchaId + "/" + fecha;
    try {
      const files = await listDatosVideos(ruta, rutaMysql, 2, canchaId); //Opcion 2 seleccion por hora
      res.json(files);
    } catch (error) {
      res.status(500).send({
        error: "Error al obtener archivos",
        message: error.message,
      });
    }
  }
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get(
  "/api/download-video/:recid/:start/:end/:filename",
  async (req, res) => {
    let contador = 0;
    let video = null;
    try {
      const { recid, start, end, filename } = req.params;
      const linkAngelCam = await LinkDescargaAngelCam(
        recid,
        start,
        end,
        `${filename}.avi`
      );
      if (linkAngelCam) {
        const idJob = await guardarArchivoDesdeURL(
          linkAngelCam,
          "/Descargas/" + filename + ".avi"
        );
        if (idJob) {
          await sleep(2600);
          while (contador < 21 && video === null) {
            video = await DescargarVideoDropBox(
              "/Descargas/" + filename + ".mp4"
            );
            await sleep(1500);
            contador++;
          }
        }
      }
      
      if (video) {
        res.setHeader("Content-Type", "video/mp4"); // Configura el tipo de contenido adecuado
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.mp4"`
        );
        // Transfiere el stream al cliente
        video.pipe(res);
      } else {
        res.status(500).send({
          error: "Error al obtener video, reporte el error.",
          message: "Despues de varios intentos, no se pudo obtener tu video.",
        });
      }
    } catch (error) {
      res.status(500).send({
        error: "Error al obtener video, reporte el error.",
        message: error.message,
      });
    }
  }
);
const LinkDescargaAngelCam = async (recording, start, end, filename) => {
  try {
    const url = `https://api.angelcam.com/v1/recording/${recording}/download/?start=${start}&end=${end}&filename=${filename}`;
    let token = "PersonalAccessToken 79b9407e7908381388bc2250e88c95d4862e5cb6";
    const options = {
      method: "GET",
      url: url,
      headers: {
        Authorization: token,
      },
    };
    const response = await axios(options);

    // Verifica el estado de la respuesta
    if (response.status === 200) {
      const jsonResponse = response.data;
      return jsonResponse.url;
    } else {
      console.log(
        `Error en la solicitud (SelectUrlAngelCam): ${response.status}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Error en la solicitud (SelectUrlAngelCam): ${error.message}`
    );
    return null;
  }
};
const guardarArchivoDesdeURL = async (UrlAngelCam, ubicacion) => {
  const url = "https://api.dropboxapi.com/2/files/save_url";
  const headers = {
    Authorization: `Bearer ${dropboxAccessToken}`, // Asegúrate de que `dropboxAccessToken` esté definido
    "Content-Type": "application/json",
  };
  const payload = {
    path: ubicacion,
    url: UrlAngelCam, // Usar `url` en minúsculas
  };

  const options = {
    method: "post",
    url: url,
    headers: headers,
    data: payload,
  };

  try {
    const response = await axios(options);
    if (response.status === 200) {
      const jsonResponse = response.data;
      return jsonResponse.async_job_id;
    } else {
      console.log(
        "Error en la solicitud (guardarArchivoDesdeURL): " + response.status
      );
    }
  } catch (error) {
    console.error(
      "Error en la solicitud (guardarArchivoDesdeURL): " + error.message
    );
  }
};
const DescargarVideoDropBox = async (filePath) => {
  try {
    const response = await axios({
      url: "https://content.dropboxapi.com/2/files/download",
      method: "POST",
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path: filePath }),
        "Content-Type": "application/octet-stream",
      },
      responseType: "stream", // Utiliza stream si estás esperando un archivo grande
    });
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Error en la solicitud: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error al descargar el archivo:", error.message, filePath);
    return null;
  }
};
const listDatosVideos = async (path, pathMysql, opc, canchaId) => {
  let datosRet = [];
  let imagenesRet = [];
  let videoRet = [];
  const links = await SelectMysqlLinks(pathMysql);
  const carpetas = await listDropboxFolder(path);
  let DatosCancha = [];
  if (opc === 2) {
    DatosCancha = await SelectMysqlCancha(canchaId);
  }
  let pasadas = 0;
  if (opc === 1) {
    pasadas = carpetas.length;
  } else {
    pasadas = 1;
  }
  for (let i = 0; i < pasadas; i++) {
    const item = carpetas[i];
    let archivos;
    if (opc === 1) {
      archivos = await listDropboxFolder(item.path_lower);
    } else {
      archivos = carpetas;
    }
    const imagenes = archivos.filter((archivo) => {
      return archivo.name.endsWith(".jpg");
    });
    const videos = archivos.filter((archivo) => {
      return archivo.name.endsWith(".mp4");
    });
    imagenesRet = [];
    for (let j = 0; j < imagenes.length; j++) {
      const image = imagenes[j];
      let url = "";
      const link_sharing = links.find((link) => link.id === image.id);
      if (link_sharing) {
        console.log("existe BD imagen");
        url = link_sharing.link;
      } else {
        console.log("consultar DropBox imagen", image.id);
        url = await obtenerLinkCompartido(image.path_lower);
      }
      imagenesRet.push({
        name: image.name,
        path_lower: image.path_lower,
        path_display: image.path_display,
        id: image.id,
        url: removeLastFourChars(url) + "raw=1",
      });
    }
    videoRet = [];
    for (let h = 0; h < videos.length; h++) {
      const video = videos[h];
      const link_sharing_vid = links.find((link) => link.id === video.id);
      if (opc === 2) {
        if (link_sharing_vid) {
          console.log("existe BD video");
          urlVid = link_sharing_vid.link;
        } else {
          console.log("DropBox Video", video.id);
          urlVid = await obtenerLinkCompartido(video.path_lower);
        }
      } else {
        urlVid = "";
      }
      videoRet.push({
        name: video.name,
        path_lower: video.path_lower,
        path_display: video.path_display,
        id: video.id,
        url: removeLastFourChars(urlVid) + "raw=1",
      });
    }
    if (imagenesRet.length === 0) {
      imagenesRet.push({
        name: "pred.png",
        path_lower: "",
        path_display: "",
        id: "pred",
        url: "https://www.dropbox.com/scl/fi/sdm90b5lucl8eaul0xaxh/pred.png?rlkey=fg4xwgrnkjgey59spwqdr70mm&st=1nco6hzu&raw=1",
      });
    }
    if (videoRet.length > 0) {
      let hora = "";
      let club = "";
      let cancha = "";
      let logo = "";
      if (opc === 1) {
        hora =
          convertirHora(item.name.substring(0, 6)) +
          " - " +
          convertirHora(item.name.substring(7, 13));
        logo = "";
        cancha = "";
        club = "";
      } else {
        hora = "";
        cancha = DatosCancha[0].nombreCancha;
        club = DatosCancha[0].nombreClub;
        logo = DatosCancha[0].logo;
      }
      datosRet.push({
        hora: hora,
        path_lower: item.path_lower,
        path_display: item.path_display,
        imagenes: imagenesRet,
        videos: videoRet,
        club: club,
        cancha: cancha,
        logo: logo,
      });
    }
  }
  return datosRet;
};
// Función para listar el contenido de una carpeta en Dropbox
const listDropboxFolder = async (path) => {
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/2/files/list_folder",
      {
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_media_info: false,
        include_mounted_folders: true,
        include_non_downloadable_files: true,
        path: path,
        recursive: false,
      },
      {
        headers: {
          Authorization: `Bearer ${dropboxAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.entries;
  } catch (error) {
    console.error(
      "Error al listar la carpeta en Dropbox:",
      error.response ? error.response.data : error.message
    );
    //throw error;
    return [];
  }
};

const obtenerLinkCompartido = async (path) => {
  let url = await listSharedLinks(path, true);
  if (url.length === 0) {
    let urlRet = await createSharedLinkWithSettings(path);
    return urlRet;
  } else {
    return url[0].url;
  }
};

const listSharedLinks = async (path, directOnly) => {
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/2/sharing/list_shared_links",
      {
        path: path,
        direct_only: directOnly,
      },
      {
        headers: {
          Authorization: `Bearer ${dropboxAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.links;
  } catch (error) {
    console.error(
      "Error al listar enlaces compartidos en Dropbox:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const createSharedLinkWithSettings = async (path) => {
  try {
    const settings = {
      access: "viewer",
      allow_download: true,
      audience: "public",
      requested_visibility: "public",
    };
    const response = await axios.post(
      "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
      {
        path: path,
        settings: settings,
      },
      {
        headers: {
          Authorization: `Bearer ${dropboxAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Devolver la respuesta de la API
    return response.data.url;
  } catch (error) {
    // Manejo de errores
    console.error(
      "Error al crear el enlace compartido en Dropbox:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

function convertirHora(horaString) {
  horaString = horaString.padStart(6, "0");
  const horas = horaString.substring(0, 2);
  const minutos = horaString.substring(2, 4);
  //const segundos = horaString.substring(4, 6);

  let hora12 = horas % 12 || 12;
  const ampm = horas < 12 ? "AM" : "PM";
  const horaFormateada = `${hora12}:${minutos} ${ampm}`;

  return horaFormateada;
}


function removeLastFourChars(str) {
  if (str) {
    return str.replace(/.{4}$/, "");
  } else {
    return "";
  }
}
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en el puerto:${port}`);
});
