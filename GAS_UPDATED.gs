const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet()

/**
 * Mapeo lógico → sheetId
 * El frontend NUNCA ve los sheetId
 */
const TABLES = {
  users: 1710932046,
  main: 853483397,
  mjlkt: 1273620281,
}

function getSheet(resource) {
  const sheetId = TABLES[resource]
  if (sheetId === undefined) {
    throw new Error('Recurso no válido')
  }
  return SPREADSHEET.getSheets().find((s) => s.getSheetId() === sheetId)
}

// READ
function doGet(e) {
  const sheet = getSheet(e.parameter.resource)
  const data = sheet.getDataRange().getValues()
  const headers = data.shift()

  const result = data.map((row) => {
    const obj = {}
    headers.forEach((h, i) => (obj[h] = row[i]))
    return obj
  })

  return json(result)
}

// CREATE / UPDATE / DELETE
function doPost(e) {
  const { resource, action } = e.parameter
  const sheet = getSheet(resource)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const body = e.parameter

  // CREATE
  if (action === 'create') {
    const row = headers.map((h) => body[h] || '')
    sheet.appendRow(row)
    return json({ success: true })
  }

  // UPDATE
  if (action === 'update') {
    // Determinar qué columna usar para buscar según la tabla
    let searchField
    if (resource === 'main') {
      searchField = 'DNI'
    } else if (resource === 'users') {
      searchField = 'id' // ← Buscar por 'id' en tabla users
    } else {
      searchField = 'DNI' // Default
    }
    let searchColumn = headers.indexOf(searchField)

    for (let i = 1; i < data.length; i++) {
      if (data[i][searchColumn] == body[searchField]) {
        // ← Busca por campo correcto
        headers.forEach((h, index) => {
          if (body[h] !== undefined) {
            sheet.getRange(i + 1, index + 1).setValue(body[h])
          }
        })
        return json({ success: true })
      }
    }
    return json({ error: 'ID no encontrado' })
  }

  // DELETE
  if (action === 'delete') {
    let searchField
    if (resource === 'main') {
      searchField = 'DNI'
    } else if (resource === 'users') {
      searchField = 'id' // ← Buscar por 'id' en tabla users
    } else {
      searchField = 'DNI' // Default
    }
    let searchColumn = headers.indexOf(searchField)

    for (let i = 1; i < data.length; i++) {
      if (data[i][searchColumn] == body[searchField]) {
        sheet.deleteRow(i + 1)
        return json({ success: true })
      }
    }
    return json({ error: 'ID no encontrado' })
  }

  return json({ error: 'Acción inválida' })
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
