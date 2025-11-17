import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";


function App() {
  const [regalos, setRegalos] = useState([]);
  const [comida, setComida] = useState([]);
  const [adornos, setAdornos] = useState([]);

  const cargarRegalos = async () => {
    const snapshot = await getDocs(collection(db, "regalos"));
    const data = snapshot.docs.map((doc) => doc.data());

    // ordenar por prioridad ascendente
    data.sort((a, b) => a.prioridad - b.prioridad);

    setRegalos(data);
  };

  const cargarComida = async () => {
    const snapshot = await getDocs(collection(db, "comida"));
    const data = snapshot.docs.map((doc) => doc.data());

    // congelados primero
    data.sort((a, b) => {
      if (a.congelado === b.congelado) return 0;
      return a.congelado ? -1 : 1;
    });

    setComida(data);  
  };

  const cargarAdornos = async () => {
    const snapshot = await getDocs(collection(db, "adornos"));
    const data = snapshot.docs.map((doc) => doc.data());

    // Cantidad menor primero
    data.sort((a, b) => a.cantidad - b.cantidad);

    setAdornos(data);
  };

  useEffect(() => {
    cargarRegalos();
    cargarComida();
    cargarAdornos();
  }, []);

  const exportarPDF = (titulo, datos) => {
    const doc = new jsPDF();
    doc.text(titulo, 10, 10);

    // convertir a tabla
    autoTable(doc, {
      startY: 20,
      head: [Object.keys(datos[0])],
      body: datos.map((item) => Object.values(item)),
    });

    doc.save(`${titulo}.pdf`);
  };

  const exportarExcel = (titulo, datos) => {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${titulo}.xlsx`);
  };

  const exportarPNG = (titulo, idTabla) => {
    const tabla = document.getElementById(idTabla);

    html2canvas(tabla).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${titulo}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const Tabla = ({ titulo, datos, id }) => {
    if (datos.length === 0) return <p>Cargando {titulo}...</p>;

    return (
      <div className="tabla-container">
        <h2>{titulo}</h2>

        <div className="botones">
          <button onClick={() => exportarPDF(titulo, datos)}>PDF</button>
          <button onClick={() => exportarExcel(titulo, datos)}>Excel</button>
          <button onClick={() => exportarPNG(titulo, id)}>PNG</button>
        </div>

        <table id={id} className="tabla">
          <thead>
            <tr>
              {Object.keys(datos[0]).map((campo) => (
                <th key={campo}>{campo}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {datos.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((valor, i) => (
                  <td key={i}>{valor.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="App">

      <h1 className="titulo-principal">Proyecto Navidad 🎄</h1>

      <Tabla titulo="Regalos" datos={regalos} id="tablaRegalos" />
      <Tabla titulo="Comida" datos={comida} id="tablaComida" />
      <Tabla titulo="Adornos" datos={adornos} id="tablaAdornos" />

    </div>
  );
}

export default App;
