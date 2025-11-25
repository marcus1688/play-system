export default function useExportExcel() {
  const isExporting = ref(false);
  const exportToExcel = async (options) => {
    isExporting.value = true;
    try {
      const XLSX = await import("xlsx");
      const defaultOptions = {
        filename: `export_${new Date()
          .toISOString()
          .replace(/[:.]/g, "")
          .split("T")
          .join("_")
          .substring(0, 17)}`,
        sheetName: "Sheet1",
        formatter: (value) => value,
      };
      const {
        data,
        filename,
        sheetName,
        columns = {},
        beforeExport,
        afterExport,
        formatter,
      } = { ...defaultOptions, ...options };
      if (!data || data.length === 0) {
        throw new Error("No data to export");
      }
      if (typeof beforeExport === "function") {
        await beforeExport();
      }
      const wb = XLSX.utils.book_new();
      let headers = [];
      let columnWidths = [];
      if (Object.keys(columns).length > 0) {
        headers = Object.entries(columns).map(
          ([key, config]) => config.header || key
        );
        columnWidths = Object.entries(columns).map(([key, config]) => ({
          wch: config.width || 10,
        }));
      } else {
        headers = Object.keys(data[0]);
        columnWidths = headers.map(() => ({ wch: 12 }));
      }
      const formattedData = data.map((item) => {
        const newItem = {};
        if (Object.keys(columns).length > 0) {
          Object.entries(columns).forEach(([key, config]) => {
            let value = item[key];
            if (typeof formatter === "function") {
              value = formatter(value, key, item);
            }
            newItem[config.header || key] = value;
          });
        } else {
          Object.keys(item).forEach((key) => {
            let value = item[key];
            if (typeof formatter === "function") {
              value = formatter(value, key, item);
            }
            newItem[key] = value;
          });
        }
        return newItem;
      });
      const ws = XLSX.utils.json_to_sheet(formattedData, {
        header: headers,
      });
      ws["!cols"] = columnWidths;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const fullFilename = `${filename}.xlsx`;
      XLSX.writeFile(wb, fullFilename);
      if (typeof afterExport === "function") {
        await afterExport(true);
      }
      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error("Export to Excel failed:", error);
      if (options.afterExport && typeof options.afterExport === "function") {
        await options.afterExport(false, error);
      }
      return { success: false, error };
    } finally {
      isExporting.value = false;
    }
  };
  return {
    isExporting,
    exportToExcel,
  };
}
