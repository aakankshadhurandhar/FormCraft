
async function createExportFile(form,formResponses,type='xlsx') {
    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Form Responses')

    let headers = []
    headers.push({ header: 'Response ID', key: 'responseID', width: 50 })
    let inputs = form.inputs
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i]
      if (input.type == 'file') {
        headers.push({
          header: input.label + ' [[filename, path, sizeInKB]]',
          key: input.label,
          width: 50,
        })
      }else {
        headers.push({ header: input.label, key: input.label, width: 30 })
      }
    }
    headers.push({ header: 'Created At', key: 'createdAt', width: 30 })
    headers.push({ header: 'Updated At', key: 'updatedAt', width: 30 })
    worksheet.columns = headers


    formResponses.forEach((formResponse) => {
      let row = {}
      const createdAt = new Date(formResponse.createdAt).toLocaleString(
        'en-IN',
        { timeZone: 'Asia/Kolkata' },
      )
      const updatedAt = new Date(formResponse.updatedAt).toLocaleString(
        'en-IN',
        { timeZone: 'Asia/Kolkata' },
      )
      row['createdAt'] = createdAt
      row['updatedAt'] = updatedAt
      row['responseID'] = formResponse._id.toString()

      let response = formResponse.response

      // Loop through headers and get the associated value from response
      headers.forEach((header) => {
        if (header.key == 'responseID' || header.key == 'createdAt' || header.key == 'updatedAt') {
          return
        }
        if (Array.isArray(response[header.key])) {
          let files = response[header.key]
          let filesArray = files.map((file) => {
            return [file.filename, file.path, file.sizeInKB]
          })
          row[header.key] = filesArray
        } else {
          row[header.key] = response[header.key]
        }
      })

      worksheet.addRow(row)
    })


    let fileName = `${form.title}-${Date.now()}`
    let filePath = `./exports/${fileName}`

    // Return file buffer
    if (type == 'csv') {
      filePath = filePath + ".csv"
      return await workbook.csv.writeBuffer()
    }
    filePath = filePath + ".xlsx"
    return await workbook.xlsx.writeBuffer()

  }

  module.exports = createExportFile