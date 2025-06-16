"use client"

import type React from "react"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  icon: React.ReactNode
}

export function PageHeader({ title, icon }: PageHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
