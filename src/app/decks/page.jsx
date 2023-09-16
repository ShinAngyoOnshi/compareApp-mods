'use client'
import React, { useState } from 'react';

import * as XLSX from 'xlsx';
import { Parser } from '@json2csv/plainjs';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Grid from '@mui/system/Unstable_Grid';
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: 180,
  height: 180,
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: 'center',
}));

const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(1),
  borderRadius: '4px',
  display:'flex',
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Home() {
  const [tableDataOld, setTableDataOld] = useState([]);
  const [tableDataNew, setTableDataNew] = useState([]);
  const [oldFileName, setOldFileName] = useState('');
  const [newFileName, setNewFileName] = useState('');
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
    const fileName = e.target.files[0].name;
    if (inputId === 'old-uploader') {
      setOldFileName(fileName);
    } else {
      setNewFileName(fileName);
    }
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
        XLSX.writeFile(wbRemoved, 'removedRowsDecks.xlsx');
      }

      if (addedRowCheck) {
        const wsAdded = XLSX.utils.json_to_sheet(addedRows);
        const wbAdded = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wbAdded, wsAdded, 'addedRows');
        XLSX.writeFile(wbAdded, 'addedRowsDecks.xlsx');
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
        aRemoved.download = 'removedRowsDecks.csv';
        aRemoved.click();
        window.URL.revokeObjectURL(urlRemoved);
      }

      if (addedRowCheck) {
        const csvAdded = parser.parse(addedRows);
        const blobAdded = new Blob([csvAdded], { type: 'text/csv' });
        const urlAdded = window.URL.createObjectURL(blobAdded);
        const aAdded = document.createElement('a');
        aAdded.href = urlAdded;
        aAdded.download = 'addedRowsDecks.csv';
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
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          '& > :not(style)': {
            m: 1,
          },
        }}
      >
        <DemoPaper variant="elevation">
          Decks
        </DemoPaper>
      </Box>
      <Box>
        <Box mb={3} >
        <Stack direction="row" spacing={2}>
          <Box>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Upload Old file
              <VisuallyHiddenInput type="file" onChange={importExcel} id="old-uploader"  />
            </Button>
            <Typography variant="caption" display="block" gutterBottom>
              {oldFileName}
            </Typography>
          </Box>
          <Box>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Upload New file
              <VisuallyHiddenInput type="file"  onChange={importExcel} id="new-uploader"  />
            </Button>
            <Typography variant="caption" display="block" gutterBottom>
              {newFileName}
            </Typography>
          </Box>
        </Stack>
        </Box>
        <Box>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid xs={6}>
            <Item>
            <input
                    type="checkbox"
                    id="added"
                    name="added"
                    checked={addedRowCheck}
                    onChange={() => {
                      setAddedRowCheck(!addedRowCheck);
                    }}
                    style={{ marginRight: 20 }}
                  />
                  <label htmlFor="added">Added Rows</label>
            </Item>
          </Grid>
          <Grid xs={6}>
            <Item>
            <input
                    type="checkbox"
                    id="removed"
                    name="removed"
                    checked={removedRowCheck}
                    onChange={() => {
                      setRemovedRowCheck(!removedRowCheck);
                    }}
                    style={{ marginRight: 20 }}
                  />
                  <label htmlFor="removed">Removed Rows</label>
            </Item>
          </Grid>
        </Grid>
        </Box>
        <Box>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid xs={6}>  
            <Item>
              <input
              type="checkbox"
              id="xlsx"
              name="xlsx"
              checked={xlsxCheck}
              onChange={() => {
                setXlsxCheck(!xlsxCheck);
              }}
              style={{ marginRight: 20 }}
            />
              <label htmlFor="xlsx">XLSX</label>
            </Item>
          </Grid>
          <Grid xs={6}>  
            <Item>
              <input
                type="checkbox"
                id="csv"
                name="csv"
                checked={csvCheck}
                onChange={() => {
                  setCsvCheck(!csvCheck);
                }}
                style={{ marginRight: 20 }}
              />
              <label htmlFor="csv">CSV</label>
            </Item>
          </Grid>
        </Grid>
        </Box>
        <Stack mt={2} direction="row" spacing={2}>
          <Button onClick={runProcess} variant="contained" endIcon={<SendIcon />}>
            Run Process
          </Button>
        </Stack>
      </Box>
    </>
  );
}
