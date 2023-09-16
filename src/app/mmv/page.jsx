'use client'
import React, { useState } from 'react';
import Link from 'next/link'

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


  const importExcel = (e) => {
    const inputId = e.target.id;
    const file = e.target.files[0];
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const rows = content.split('\n').map((line) => line.split('\t'));
  
      extractData(rows, inputId);
    };
    reader.readAsText(file);
  };
  

  function findRemovedRows(tableDataOld, tableDataNew) {
    return tableDataOld.filter((oldRow) =>
      !tableDataNew.some((newRow) =>  newRow[6] === oldRow[6])
    );
  }

  function findAddedRows(tableDataOld, tableDataNew) {
    return tableDataNew.filter((newRow) =>
      !tableDataOld.some((oldRow) => oldRow[6] === newRow[6])
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
        XLSX.writeFile(wbRemoved, 'removedRowsMMV.xlsx');
      }

      if (addedRowCheck) {
        const wsAdded = XLSX.utils.json_to_sheet(addedRows);
        const wbAdded = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wbAdded, wsAdded, 'addedRows');
        XLSX.writeFile(wbAdded, 'addedRowsMMV.xlsx');
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
        aRemoved.download = 'removedRowsMMV.csv';
        aRemoved.click();
        window.URL.revokeObjectURL(urlRemoved);
      }

      if (addedRowCheck) {
        const csvAdded = parser.parse(addedRows);
        const blobAdded = new Blob([csvAdded], { type: 'text/csv' });
        const urlAdded = window.URL.createObjectURL(blobAdded);
        const aAdded = document.createElement('a');
        aAdded.href = urlAdded;
        aAdded.download = 'addedRowsMMV.csv';
        aAdded.click();
        window.URL.revokeObjectURL(urlAdded);
      }
    }
  };

  function extractData(rows, inputId) {
    if (inputId === 'old-uploader') {
      setTableDataOld(rows);
    } else {
      setTableDataNew(rows);
    }
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
