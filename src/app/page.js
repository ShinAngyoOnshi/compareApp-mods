'use client'
import React, { useState } from 'react'
import * as XLSX from 'xlsx'

import styles from './page.module.css'

export default function Home() {

  const [tableDataOld, setTableDataOld] = useState([])
  const [tableDataNew, setTableDataNew] = useState([])

  const convertToJson = async (headers, data, inputId) => {
    const rows = []
    data.forEach(async row => {
      let rowData = {}
      row.forEach( async (element, index) => {
        rowData[headers[index]] = element
      })
      // console.log('rowData: ', rowData)
      rows.push(rowData)
    });
    // if (inputId === 'old-uploader') {
    //   setTableDataOld(rows)
    // } else {
    //   setTableDataNew(rows)
    // }
    return rows
  }

  const importExcel = (e) => {
    const inputId = e.target.id
    const file = e.target.files[0]

    const reader = new FileReader()
    reader.onload = (event) => {
      const bstr = event.target.result
      const workBook = XLSX.read(bstr, { type: "binary"})
      extractData(workBook, inputId)
      const workSheetName = workBook.SheetNames[0]
      const workSheet = workBook.Sheets[workSheetName]
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header : 1})
      const headers = fileData[0]
      const heads = headers.map(head => ({ title: head, field: head}))
      fileData.splice(0,1)
      convertToJson(headers, fileData, inputId)
    }
    reader.readAsBinaryString(file)
  }

  function findRemovedRows(tableDataOld, tableDataNew) {
    return tableDataOld.filter(oldRow => 
        !tableDataNew.some(newRow => newRow.Field5_links === oldRow.Field5_links)
    );
  }
  function findAddedRows(tableDataOld, tableDataNew) {
    return tableDataNew.filter(newRow => 
        !tableDataOld.some(oldRow => oldRow.Field5_links === newRow.Field5_links)
    );
  }
  const runProcess = () => {
    console.log('In processing')
    const removedRows = findRemovedRows(tableDataOld, tableDataNew);
    const addedRows = findAddedRows(tableDataOld, tableDataNew);
    console.log(removedRows)
    console.log(addedRows)
  }

  function extractData(file, inputId) {
    const data = [];

    const sheets = file.SheetNames;
    
    for(let i = 0; i < sheets.length; i++) {
        const temp = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
        temp.forEach((res) => {
            const code = extractCodeFromURL(res.Field5_links);
            // Add the extracted code as a new property
            res.field_6 = code;
            data.push(res);
        });
    }
    if (inputId === 'old-uploader') {
      setTableDataOld(data)
    } else {
      setTableDataNew(data)
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
          <p>
            Old file
          </p>
          <input type='file' onChange={importExcel} id='old-uploader' />
          <p>
            New file
          </p>
          <input type='file' onChange={importExcel} id='new-uploader' />
          <div>
            <p>
              Run Process
            </p>
            <button onClick={runProcess}>Run</button>
          </div>
        </div>

    </main>
  )
}
