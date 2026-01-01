const ensureSheet = async (doc, title, headers) => {
    let sheet = doc.sheetsByTitle[title];
    if (!sheet) {
        sheet = await doc.addSheet({ title, headerValues: headers });
    } else {
        try {
            await sheet.loadHeaderRow();
            const currentHeaders = sheet.headerValues;
            const missingHeaders = headers.filter(h => !currentHeaders.includes(h));

            if (missingHeaders.length > 0) {
                const newHeaders = [...currentHeaders, ...missingHeaders];
                if (sheet.gridProperties.columnCount < newHeaders.length) {
                    try {
                        await sheet.resize({ colCount: newHeaders.length });
                    } catch (e) {
                        console.log('Resize skipped/failed', e.message);
                    }
                }
                await sheet.setHeaderRow(newHeaders);
            }
        } catch (err) {
            // Likely empty sheet, set headers
            await sheet.setHeaderRow(headers);
        }
    }
    return sheet;
};

module.exports = { ensureSheet };
