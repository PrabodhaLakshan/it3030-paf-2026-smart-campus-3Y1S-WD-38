import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createResource, importResourcesCsv } from "../../api/resourceApi";
import ResourceForm from "../../components/resources/ResourceForm";

function CreateResourcePage() {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { success, message, errors }
  const [dragOver, setDragOver] = useState(false);

  const handleCreate = async (data) => {
    try {
      await createResource(data);
      navigate("/admin/resources");
    } catch (err) {
      throw err; // Let ResourceForm catch & display the error
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.name.endsWith(".csv")) {
      setImportFile(file);
      setImportResult(null);
    } else {
      alert("Please select a valid .csv file.");
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const response = await importResourcesCsv(importFile);
      const data = response.data;
      setImportResult({
        success: true,
        message: data.message || `Successfully imported ${data.imported} resource(s).`,
        imported: data.imported,
        errors: data.errors || [],
      });
      setImportFile(null);
    } catch (err) {
      const errData = err?.response?.data;
      setImportResult({
        success: false,
        message: errData?.message || "Import failed. Please check your CSV file and try again.",
        errors: errData?.errors || [],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="mb-6 flex gap-4 items-center">
        <Link to="/admin/resources" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Resource</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new resource manually or bulk import via CSV.</p>
        </div>
      </div>

      {/* Import CSV Section */}
      <div className="mb-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Bulk Import via CSV</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload a CSV file to import multiple resources at once. Required columns:
              <span className="font-mono text-blue-600 ml-1">name, type, capacity, location, availabilityStart, availabilityEnd, status, description</span>
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Download a sample CSV
              const sample = [
                "name,type,capacity,location,availabilityStart,availabilityEnd,status,description",
                "Computer Lab A,LAB,30,Block A Floor 1,08:00,18:00,ACTIVE,Main computer lab",
                "Lecture Hall 1,LECTURE_HALL,120,Block B Ground Floor,08:00,20:00,ACTIVE,Large lecture hall",
                "Meeting Room 2,MEETING_ROOM,15,Block C Floor 2,09:00,17:00,OUT_OF_SERVICE,Under renovation",
              ].join("\n");
              const blob = new Blob([sample], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "resource_import_template.csv";
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 underline whitespace-nowrap flex-shrink-0"
          >
            Download Template
          </a>
        </div>

        <div className="p-5">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              handleFileSelect(file);
            }}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              id="csv-import-input"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            {importFile ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{importFile.name}</p>
                  <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(1)} KB · Ready to import</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImportFile(null); setImportResult(null); }}
                  className="ml-2 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-600">Drag & drop your CSV file here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              </>
            )}
          </div>

          {/* Import Button */}
          {importFile && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import {importFile.name}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`mt-4 rounded-xl p-4 border ${importResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${importResult.success ? "text-green-800" : "text-red-800"}`}>
                    {importResult.message}
                  </p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                  {importResult.success && (
                    <button
                      onClick={() => navigate("/admin/resources")}
                      className="mt-2 text-xs font-semibold text-green-700 underline hover:text-green-800"
                    >
                      View all resources →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center mb-8">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white px-2">Or create manually</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <ResourceForm onSubmit={handleCreate} submitLabel="Create Resource" />
    </div>
  );
}

export default CreateResourcePage;