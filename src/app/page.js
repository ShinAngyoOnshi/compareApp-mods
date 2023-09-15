'use client'
import React, { useState } from 'react'
import * as XLSX from 'xlsx'

import styles from './page.module.css'

export default function Home() {
  const convertToJson = async (headers, data) => {
    const rows = []
    data.forEach(async row => {
      let rowData = {}
      row.forEach( async (element, index) => {
        rowData[headers[index]] = element
      })
      console.log('rowData: ', rowData)
      rows.push(rowData)
    });
    setTableData(rows)
    return rows
  }
  const importExcel = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const bstr = event.target.result
      const workBook = XLSX.read(bstr, { type: "binary"})
      const workSheetName = workBook.SheetNames[0]
      const workSheet = workBook.Sheets[workSheetName]
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header : 1})
      const headers = fileData[0]
      const heads = headers.map(head => ({ title: head, field: head}))
      fileData.splice(0,1)
      convertToJson(headers, fileData)
    }
    reader.readAsBinaryString(file)
  }
  const [tableData, setTableData] = useState([])

  return (
    <main className={styles.main}>
        <div>
          <input type='file' onChange={importExcel} />
        </div>
    </main>
  )
}
