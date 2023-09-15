'use client'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Parser } from '@json2csv/plainjs';

import styles from '../page.module.css';

export default function Home() {
  const [tableDataOld, setTableDataOld] = useState([]);
  const [tableDataNew, setTableDataNew] = useState([]);
  const [csvCheck, setCsvCheck] = useState(true);
  const [xlsxCheck, setXlsxCheck] = useState(false);
  const [addedRowCheck, setAddedRowCheck] = useState(true);
  const [removedRowCheck, setRemovedRowCheck] = useState(true);

  const convertToJson = async (headers, data) => {
    const rows = [];
    data.forEach(async (row) => {
      let rowData = {};
      row.forEach(async (element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };

  const importExcel = (e) => {
    const inputId = e.target.id;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: 'binary' });
      extractData(workBook, inputId);
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      fileData.splice(0, 1);
      convertToJson(headers, fileData);
    };
    reader.readAsBinaryString(file);
  };

  function findRemovedRows(tableDataOld, tableDataNew) {
    return tableDataOld.filter((oldRow) =>
      !tableDataNew.some((newRow) => newRow.Field5_links === oldRow.Field5_links)
    );
  }

  function findAddedRows(tableDataOld, tableDataNew) {
    return tableDataNew.filter((newRow) =>
      !tableDataOld.some((oldRow) => oldRow.Field5_links === newRow.Field5_links)
    );
  }

  const runProcess = () => {
    console.log('In processing');
    const removedRows = findRemovedRows(tableDataOld, tableDataNew);
    const addedRows = findAddedRows(tableDataOld, tableDataNew);

    if (xlsxCheck) {
      if (removedRowCheck) {
        const wsRemoved = XLSX.utils.json_to_sheet(removedRows);
        const wbRemoved = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wbRemoved, wsRemoved, 'removedRows');
        XLSX.writeFile(wbRemoved, 'removedRows.xlsx');
      }

      if (addedRowCheck) {
        const wsAdded = XLSX.utils.json_to_sheet(addedRows);
        const wbAdded = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wbAdded, wsAdded, 'addedRows');
        XLSX.writeFile(wbAdded, 'addedRows.xlsx');
      }
    }

    if (csvCheck) {
      const parser = new Parser();
      if (removedRowCheck) {
        const csvRemoved = parser.parse(removedRows);
        const blobRemoved = new Blob([csvRemoved], { type: 'text/csv' });
        const urlRemoved = window.URL.createObjectURL(blobRemoved);
        const aRemoved = document.createElement('a');
        aRemoved.href = urlRemoved;
        aRemoved.download = 'removedRows.csv';
        aRemoved.click();
        window.URL.revokeObjectURL(urlRemoved);
      }

      if (addedRowCheck) {
        const csvAdded = parser.parse(addedRows);
        const blobAdded = new Blob([csvAdded], { type: 'text/csv' });
        const urlAdded = window.URL.createObjectURL(blobAdded);
        const aAdded = document.createElement('a');
        aAdded.href = urlAdded;
        aAdded.download = 'addedRows.csv';
        aAdded.click();
        window.URL.revokeObjectURL(urlAdded);
      }
    }
  };

  function extractData(file, inputId) {
    const data = [];
    const sheets = file.SheetNames;

    for (let i = 0; i < sheets.length; i++) {
      const temp = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
      temp.forEach((res) => {
        const code = extractCodeFromURL(res.Field5_links);
        // Add the extracted code as a new property
        res.field_6 = code;
        data.push(res);
      });
    }

    if (inputId === 'old-uploader') {
      setTableDataOld(data);
    } else {
      setTableDataNew(data);
    }
    return data;
  }

  function extractCodeFromURL(url) {
    const regex = /\/(\d+)-/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  return (
    <main className={styles.main}>
      <div>
        <p>Old file</p>
        <input type="file" onChange={importExcel} id="old-uploader" />
        <p>New file</p>
        <input type="file" onChange={importExcel} id="new-uploader" />
        <div>
          <input
            type="checkbox"
            id="added"
            name="added"
            checked={addedRowCheck}
            onChange={() => {
              setAddedRowCheck(!addedRowCheck);
            }}
          />
          <label htmlFor="added">Added Rows</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="removed"
            name="removed"
            checked={removedRowCheck}
            onChange={() => {
              setRemovedRowCheck(!removedRowCheck);
            }}
          />
          <label htmlFor="removed">Removed Rows</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="xlsx"
            name="xlsx"
            checked={xlsxCheck}
            onChange={() => {
              setXlsxCheck(!xlsxCheck);
            }}
          />
          <label htmlFor="xlsx">XLSX</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="csv"
            name="csv"
            checked={csvCheck}
            onChange={() => {
              setCsvCheck(!csvCheck);
            }}
          />
          <label htmlFor="csv">CSV</label>
        </div>
        <div>
          <p>Run Process</p>
          <button onClick={runProcess}>Run</button>
        </div>
      </div>
    </main>
  );
}
