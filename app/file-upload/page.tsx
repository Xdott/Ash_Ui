"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, X, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  allowedTypes?: string[]
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
  url?: string
}

export default function FileUploadPage({
  maxFiles = 5,
  maxSize = 50, // 50MB
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFiles = (selectedFiles: File[]) => {
    // Check if adding these files would exceed the max files limit
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files at once.`,
        variant: "destructive",
      })
      return
    }

    const newFiles: UploadedFile[] = selectedFiles.map((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of ${maxSize}MB.`,
          variant: "destructive",
        })
        return {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 100,
          status: "error",
          error: `File exceeds the maximum size of ${maxSize}MB`,
        }
      }

      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 100,
          status: "error",
          error: "File type not supported",
        }
      }

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
      }
    })

    const validFiles = newFiles.filter((file) => file.status !== "error")
    const allFiles = [...files, ...newFiles]
    setFiles(allFiles)

    // Upload valid files
    validFiles.forEach((fileInfo) => {
      const fileToUpload = selectedFiles.find((f) => f.name === fileInfo.name)
      if (fileToUpload) {
        uploadFile(fileToUpload, fileInfo.id)
      }
    })
  }

  const uploadFile = async (file: File, fileId: string) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === fileId && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
        )
      }, 300)

      // Use fetch instead of axios
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      const data = await response.json()

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 100,
                status: "success",
                url: data.url || `${API_URL}/files/${data.filename}`,
              }
            : f,
        ),
      )

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Upload error:", error)

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 100,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      )

      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(new Blob([fileType], { type: fileType || "/placeholder.svg" }))}
          alt="preview"
          className="w-8 h-8 object-cover rounded"
        />
      )
    }

    return <FileText className="w-6 h-6 text-blue-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drag and drop area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <div className="flex flex-col items-center justify-center space-y-3 cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload up to {maxFiles} files (max {maxSize}MB each)
                </p>
              </div>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Progress</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{getFileIcon(file.type)}</TableCell>
                      <TableCell className="font-medium">
                        {file.name}
                        {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <span className="capitalize">{file.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Progress value={file.progress} className="h-2" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {file.status === "success" && file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          )}
                          <button onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-500">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Upload button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload More Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertDescription>
          <p className="font-medium">Supported file types:</p>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Images: JPG, PNG</li>
            <li>Documents: PDF</li>
            <li>Spreadsheets: CSV, XLS, XLSX</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
